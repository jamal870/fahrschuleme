/**
 * Bringt das Appwrite-Schema in einem Durchgang zu Ende.
 *
 * Ablauf:
 *   1. Worker-Health-Check (Probe-Collection: Attribut anlegen -> muss "available" werden)
 *   2. Collections mit hängenden Attributen komplett löschen und neu anlegen
 *      (statt einzelne Attribute zu reparieren – das blockiert in Appwrite 1.5.7)
 *   3. Warten bis alle Attribute "available" sind
 *   4. Alle Indexe anlegen
 *
 * Start:
 *   ./run-migration.sh finish
 */

import { Client, Databases } from "node-appwrite";
import { collections } from "./create-collections.js";

const endpoint = process.env.APPWRITE_ENDPOINT || "https://api.fahrschule-me.ch/v1";
const project = process.env.APPWRITE_PROJECT || "6a773fb100114c0e82c8";
const apiKey = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.APPWRITE_DB || "fahrschule-me-db";

if (!apiKey) {
  console.error("Fehlt: APPWRITE_API_KEY – bitte ./run-migration.sh nutzen.");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(project).setKey(apiKey);
const db = new Databases(client);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, init = {}) {
  const response = await fetch(`${endpoint}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": project,
      "X-Appwrite-Key": apiKey,
      ...(init.headers || {}),
    },
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const error = new Error(body.message || `HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return body;
}

const attrPath = (colId) =>
  `/databases/${encodeURIComponent(DB_ID)}/collections/${encodeURIComponent(colId)}/attributes`;

async function attributeStates(colId) {
  try {
    const result = await api(attrPath(colId));
    return new Map((result.attributes || []).map((a) => [a.key, a.status]));
  } catch (e) {
    if (e.status === 404) return null; // Collection existiert nicht
    throw e;
  }
}

async function createAttribute(colId, [type, key, size, required]) {
  switch (type) {
    case "string":
      return db.createStringAttribute(DB_ID, colId, key, size, required);
    case "email":
      return db.createEmailAttribute(DB_ID, colId, key, required);
    case "integer":
      return db.createIntegerAttribute(DB_ID, colId, key, required);
    case "double":
      return db.createFloatAttribute(DB_ID, colId, key, required);
    case "boolean":
      return db.createBooleanAttribute(DB_ID, colId, key, required);
    case "datetime":
      return db.createDatetimeAttribute(DB_ID, colId, key, required);
    default:
      throw new Error(`Unbekannter Typ: ${type}`);
  }
}

/** Schritt 1: Verarbeitet der Datenbank-Worker überhaupt Jobs? */
async function workerHealthCheck() {
  const probeId = `healthcheck_${Date.now().toString(36)}`;
  console.log("1/4  Worker-Health-Check ...");

  await db.createCollection(DB_ID, probeId, "Health Check", [], false, true);
  await db.createStringAttribute(DB_ID, probeId, "probe", 32, false);

  let status = "unknown";
  for (let i = 0; i < 30; i++) {
    await sleep(2000);
    const states = await attributeStates(probeId);
    status = states?.get("probe") || "missing";
    if (status === "available") break;
    if (status === "failed") break;
  }

  await db.deleteCollection(DB_ID, probeId).catch(() => {});

  if (status !== "available") {
     console.error(`
✖ Der Datenbank-Worker verarbeitet keine Jobs (Probe-Status: ${status}).
  Auf dem VPS ausführen und danach dieses Skript erneut starten:

    cd /opt/appwrite
    docker compose restart redis appwrite-worker-databases appwrite
    docker logs --tail 40 appwrite-worker-databases
`);
    process.exit(2);
  }
  console.log("     ✔ Worker verarbeitet Jobs (Probe in unter 60 s verfügbar)\n");
}

/** Schritt 2: Kaputte Collections hart neu aufsetzen. */
async function resetBrokenCollections() {
  console.log("2/4  Collections prüfen ...");
  const broken = [];

  for (const col of collections) {
    const states = await attributeStates(col.id);
    if (states === null) {
      broken.push({ col, reason: "fehlt" });
      continue;
    }
    const stuck = [...states.entries()].filter(([, s]) => s !== "available");
    const missing = col.attributes.filter(([, key]) => !states.has(key));
    if (stuck.length || missing.length) {
      broken.push({
        col,
        reason: [
          stuck.length ? `hängend: ${stuck.map(([k, s]) => `${k}=${s}`).join(", ")}` : null,
          missing.length ? `fehlend: ${missing.map(([, k]) => k).join(", ")}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
      });
    }
  }

  if (!broken.length) {
    console.log("     ✔ Alle Collections vollständig\n");
    return;
  }

  for (const { col, reason } of broken) {
    console.log(`     • ${col.id}: ${reason}`);
  }

  for (const { col } of broken) {
    // Löschen der ganzen Collection ist zuverlässig, einzelne Attribute nicht.
    await db.deleteCollection(DB_ID, col.id).catch((e) => {
      if (e.code !== 404) console.warn(`     ! Löschen ${col.id}: ${e.message}`);
    });
  }

  // Warten bis alle wirklich weg sind.
  for (const { col } of broken) {
    for (let i = 0; i < 30; i++) {
      const states = await attributeStates(col.id);
      if (states === null) break;
      await sleep(2000);
    }
  }
  console.log("     ✔ Betroffene Collections gelöscht");

  for (const { col } of broken) {
    await db.createCollection(DB_ID, col.id, col.name, col.permissions, false, true);
    for (const attr of col.attributes) {
      try {
        await createAttribute(col.id, attr);
      } catch (e) {
        if (e.code !== 409) console.error(`     ✖ ${col.id}.${attr[1]}: ${e.message}`);
      }
      await sleep(200);
    }
    console.log(`     ✔ ${col.id} neu angelegt (${col.attributes.length} Attribute)`);
  }
  console.log("");
}

/** Schritt 3: Warten bis alle Attribute verfügbar sind. */
async function waitForAttributes() {
  console.log("3/4  Warte auf Attribute ...");
  const deadline = Date.now() + 10 * 60 * 1000;

  while (Date.now() < deadline) {
    const pending = [];
    for (const col of collections) {
      const states = await attributeStates(col.id);
      for (const [, key] of col.attributes) {
        const status = states?.get(key) || "missing";
        if (status !== "available") pending.push(`${col.id}.${key}=${status}`);
      }
    }
    if (!pending.length) {
      console.log("     ✔ Alle Attribute verfügbar\n");
      return true;
    }
    console.log(`     … noch ${pending.length} offen (z. B. ${pending.slice(0, 3).join(", ")})`);
    await sleep(5000);
  }

  console.error("     ✖ Timeout: Attribute wurden nicht verfügbar.");
  return false;
}

/** Schritt 4: Indexe anlegen. */
async function createIndexes() {
  console.log("4/4  Indexe anlegen ...");
  let created = 0;
  let existing = 0;

  for (const col of collections) {
    for (const [key, type, attrs] of col.indexes || []) {
      try {
        await db.createIndex(DB_ID, col.id, key, type, attrs);
        created++;
        console.log(`     ✔ ${col.id}.${key}`);
      } catch (e) {
        if (e.code === 409) {
          existing++;
        } else {
          console.error(`     ✖ ${col.id}.${key}: [${e.code || "?"}] ${e.message}`);
        }
      }
      await sleep(300);
    }
  }
  console.log(`     ✔ ${created} neu, ${existing} bereits vorhanden\n`);
}

async function run() {
  console.log(`Appwrite Setup – ${endpoint} / DB ${DB_ID}\n`);
  await workerHealthCheck();
  await resetBrokenCollections();
  const ready = await waitForAttributes();
  if (!ready) process.exit(3);
  await createIndexes();
  console.log("Fertig: Schema komplett. Nächster Schritt: Datenexport aus dem alten Backend.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
