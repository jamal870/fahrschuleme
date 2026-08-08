/**
 * Repariert hängende Appwrite-Attribute (Status: processing/failed/stuck).
 *
 * Hintergrund (Appwrite 1.5.x):
 *  - DELETE /attributes/{key} markiert das Attribut nur als Status "deleting"
 *    und stellt einen Job in die "database"-Queue (Worker). Der HTTP-Call
 *    kehrt sofort zurück, BEVOR das Attribut aus der zugrunde liegenden
 *    MariaDB-Spalte/Collection-Metadaten entfernt wurde (async job, siehe
 *    appwrite/appwrite src/Appwrite/Platform/Workers/Database.php und
 *    app/controllers/api/databases.php – deleteAttribute).
 *  - Legt man SOFORT danach (ohne zu warten) ein Attribut mit demselben Key
 *    neu an, meldet die API "Attribute with the requested key already
 *    exists" (409), weil der Delete-Job noch nicht durch den Worker
 *    verarbeitet wurde bzw. das Attribut-Dokument in der Collection noch
 *    existiert (Status "deleting"/"stuck" statt tatsächlich entfernt).
 *  - Läuft der Datenbank-Worker nicht (z.B. weil die Queue/Redis nicht
 *    erreichbar ist oder der Worker-Container down/überlastet ist), bleibt
 *    das Attribut dauerhaft in "processing"/"deleting"/"failed" hängen –
 *    unabhängig davon, wie oft man DELETE erneut aufruft.
 *  - Bekannte GitHub-Issues zu diesem Verhalten:
 *      appwrite/appwrite#6376  "Attribute stuck in processing"
 *      appwrite/appwrite#6982  "Attribute already exists after delete"
 *      appwrite/appwrite#7714  "createIndex/Attribute 409 despite not existing"
 *    Alle bestätigen: Ursache ist der asynchrone Queue-Prozess, nicht die
 *    REST-API selbst. Empfohlene Lösung laut Maintainern: nach DELETE
 *    aktiv pollen, bis das Attribut aus GET /attributes verschwindet
 *    (bzw. Status != deleting/processing), statt fix zu warten.
 *
 * Robuste Strategie in diesem Skript:
 *  1. Vor jedem Fix: aktuellen Status holen.
 *  2. Falls "available": nichts tun.
 *  3. Falls vorhanden, aber nicht "available":
 *     a. DELETE aufrufen (idempotent, 404 wird ignoriert).
 *     b. Aktiv pollen (GET /attributes), bis der Key wirklich verschwunden
 *        ist – NICHT nur eine feste Sleep-Zeit einplanen. Timeout mit
 *        klarer Fehlermeldung, falls der Worker die Queue nicht abarbeitet.
 *  4. CREATE erst nach bestätigtem Verschwinden versuchen.
 *  5. CREATE selbst mit Retry bei 409 ("already exists") ausstatten, da
 *     Race Conditions zwischen Metadaten-Cache und Worker möglich sind
 *     (siehe Appwrite-Cache-Layer, der Attribut-Listen zwischenspeichert).
 *  6. Nach dem Anlegen erneut auf "available" pollen, bevor Indexe erstellt
 *     werden (Indexe auf nicht-verfügbaren Attributen schlagen ebenfalls
 *     mit 400/404 fehl).
 *
 * Nutzung auf dem VPS:
 *   export APPWRITE_ENDPOINT=https://api.fahrschule-me.ch/v1
 *   export APPWRITE_PROJECT=6a773fb100114c0e82c8
 *   export APPWRITE_DB=fahrschule-me-db
 *   read -r -s APPWRITE_API_KEY && export APPWRITE_API_KEY
 *   node repair-attributes.js
 */

import { Client, Databases } from "node-appwrite";

const endpoint = process.env.APPWRITE_ENDPOINT || "https://api.fahrschule-me.ch/v1";
const project = process.env.APPWRITE_PROJECT || "6a773fb100114c0e82c8";
const apiKey = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.APPWRITE_DB || "fahrschule-me-db";

if (!apiKey) {
  console.error("Fehlt: APPWRITE_API_KEY");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Nur die Attribute, die für Indexe gebraucht werden bzw. erfahrungsgemäß hängen. */
const schema = {
  bookings: {
    attrs: {
      email: ["email", null, true],
      status: ["string", 32, false],
    },
    indexes: [
      ["idx_email", "key", ["email"]],
      ["idx_status", "key", ["status"]],
    ],
  },
  booking_items: {
    attrs: {
      bookingId: ["string", 64, true],
      courseDateId: ["string", 64, false],
    },
    indexes: [
      ["idx_booking", "key", ["bookingId"]],
      ["idx_coursedate", "key", ["courseDateId"]],
    ],
  },
  course_dates: {
    attrs: { date: ["string", 32, true] },
    indexes: [["idx_date", "key", ["date"]]],
  },
  course_signatures: {
    attrs: { courseDateId: ["string", 64, true] },
    indexes: [["idx_course", "key", ["courseDateId"]]],
  },
  waitlist: {
    attrs: { courseDateId: ["string", 64, false] },
    indexes: [["idx_course", "key", ["courseDateId"]]],
  },
  site_content: {
    attrs: { key: ["string", 128, true] },
    indexes: [["idx_key", "unique", ["key"]]],
  },
  user_roles: {
    attrs: { userId: ["string", 64, true] },
    indexes: [["idx_user", "key", ["userId"]]],
  },
};

const DELETE_POLL_TIMEOUT_MS = 120_000;
const DELETE_POLL_INTERVAL_MS = 3_000;
const CREATE_RETRY_ATTEMPTS = 5;
const CREATE_RETRY_DELAY_MS = 4_000;
const AVAILABLE_POLL_TIMEOUT_MS = 180_000;
const AVAILABLE_POLL_INTERVAL_MS = 10_000;

async function getAttributes(colId) {
  const res = await fetch(
    `${endpoint}/databases/${encodeURIComponent(DB_ID)}/collections/${encodeURIComponent(colId)}/attributes`,
    { headers: { "X-Appwrite-Project": project, "X-Appwrite-Key": apiKey } },
  );
  if (!res.ok) throw new Error(`GET attributes ${colId}: HTTP ${res.status} ${await res.text()}`);
  const json = await res.json();
  return new Map((json.attributes || []).map((a) => [a.key, a.status]));
}

/** DELETE ist idempotent: 404 (bereits weg) wird als Erfolg gewertet. */
async function safeDeleteAttribute(colId, key) {
  try {
    await db.deleteAttribute(DB_ID, colId, key);
  } catch (e) {
    if (e.code === 404) return; // schon weg – ok
    throw e;
  }
}

/** Aktiv pollen, bis das Attribut aus der Liste verschwunden ist. */
async function waitUntilGone(colId, key) {
  const deadline = Date.now() + DELETE_POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const states = await getAttributes(colId);
    if (!states.has(key)) return true;
    console.log(`   … warte auf Löschung ${colId}.${key} (Status: ${states.get(key)})`);
    await sleep(DELETE_POLL_INTERVAL_MS);
  }
  return false;
}

/** Aktiv pollen, bis das Attribut "available" ist. */
async function waitUntilAvailable(colId, key, timeoutMs = AVAILABLE_POLL_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const states = await getAttributes(colId);
    const status = states.get(key);
    if (status === "available") return true;
    if (status === "failed") return false;
    await sleep(AVAILABLE_POLL_INTERVAL_MS);
  }
  return false;
}

async function createAttribute(colId, key, [type, size, required]) {
  switch (type) {
    case "string":
      return db.createStringAttribute(DB_ID, colId, key, size, required);
    case "email":
      return db.createEmailAttribute(DB_ID, colId, key, required);
    default:
      throw new Error(`Unbekannter Typ: ${type}`);
  }
}

/**
 * Legt das Attribut an; behandelt 409 ("already exists") als transientes
 * Problem, sofern das Attribut laut Cache/Delay noch abklingt, und
 * wiederholt den Versuch statt sofort abzubrechen.
 */
async function createAttributeWithRetry(colId, key, spec) {
  for (let attempt = 1; attempt <= CREATE_RETRY_ATTEMPTS; attempt++) {
    try {
      await createAttribute(colId, key, spec);
      return;
    } catch (e) {
      const isConflict = e.code === 409;
      if (!isConflict || attempt === CREATE_RETRY_ATTEMPTS) throw e;
      console.log(
        `   ↻ Anlegen ${colId}.${key} lieferte 409 (already exists), Versuch ${attempt}/${CREATE_RETRY_ATTEMPTS} – warte und prüfe erneut ...`,
      );
      // Evtl. existiert es doch noch (Race/Cache) -> erneut löschen+abwarten.
      await safeDeleteAttribute(colId, key);
      await waitUntilGone(colId, key);
      await sleep(CREATE_RETRY_DELAY_MS);
    }
  }
}

async function run() {
  const results = [];

  for (const [colId, def] of Object.entries(schema)) {
    const states = await getAttributes(colId);
    for (const [key, spec] of Object.entries(def.attrs)) {
      const status = states.get(key) || "missing";
      if (status === "available") {
        console.log(`• ok: ${colId}.${key}`);
        continue;
      }

      console.log(`↻ repariere ${colId}.${key} (Status: ${status})`);

      if (status !== "missing") {
        await safeDeleteAttribute(colId, key);
        const gone = await waitUntilGone(colId, key);
        if (!gone) {
          console.error(
            `   ✖ ${colId}.${key} wurde nach ${DELETE_POLL_TIMEOUT_MS / 1000}s nicht gelöscht. ` +
              `Der Datenbank-Worker verarbeitet die Queue vermutlich nicht (Redis/Worker prüfen). Überspringe.`,
          );
          results.push(`${colId}.${key}: DELETE hängt`);
          continue;
        }
      }

      try {
        await createAttributeWithRetry(colId, key, spec);
        console.log(`   ✔ neu angelegt: ${colId}.${key}, warte auf 'available' ...`);
        const available = await waitUntilAvailable(colId, key);
        if (available) {
          console.log(`   ✔ available: ${colId}.${key}`);
        } else {
          console.error(`   ✖ ${colId}.${key} wurde nicht 'available' (Timeout oder 'failed').`);
          results.push(`${colId}.${key}: CREATE hängt/failed`);
        }
      } catch (e) {
        console.error(`   ✖ Anlegen endgültig fehlgeschlagen: ${e.message}`);
        results.push(`${colId}.${key}: ${e.message}`);
      }
    }
  }

  if (results.length) {
    console.error("\n✖ Folgende Attribute konnten nicht sauber repariert werden:");
    results.forEach((r) => console.error(`   - ${r}`));
    console.error(
      "→ Prüfe: 1) Läuft der 'appwrite-worker-databases' Container? 2) Ist Redis erreichbar? " +
        "3) `docker logs appwrite-worker-databases` auf Fehler/Deadlocks in MariaDB prüfen.",
    );
    process.exit(1);
  }

  console.log("\nAlle Attribute available. Lege Indexe an ...");
  for (const [colId, def] of Object.entries(schema)) {
    for (const [key, type, attrs] of def.indexes || []) {
      try {
        await db.createIndex(DB_ID, colId, key, type, attrs);
        console.log(`   ✔ Index ${colId}.${key}`);
      } catch (e) {
        if (e.code === 409) console.log(`   • Index existiert: ${colId}.${key}`);
        else console.error(`   ✖ Index ${colId}.${key}: ${e.message}`);
      }
      await sleep(500);
    }
  }

  console.log("\nFertig.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
