/**
 * Repariert hängende Appwrite-Attribute (Status: processing/failed/stuck).
 *
 * Vorgehen:
 *  1. Alle Collections scannen und Attribute finden, die nicht "available" sind
 *  2. Diese Attribute löschen und exakt nach Schema neu anlegen
 *  3. Warten bis alle "available" sind
 *  4. Fehlende Indexe anlegen
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

async function getAttributes(colId) {
  const res = await fetch(
    `${endpoint}/databases/${encodeURIComponent(DB_ID)}/collections/${encodeURIComponent(colId)}/attributes`,
    { headers: { "X-Appwrite-Project": project, "X-Appwrite-Key": apiKey } },
  );
  if (!res.ok) throw new Error(`GET attributes ${colId}: HTTP ${res.status} ${await res.text()}`);
  const json = await res.json();
  return new Map((json.attributes || []).map((a) => [a.key, a.status]));
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

async function run() {
  // 1 + 2: hängende Attribute löschen und neu anlegen
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
        try {
          await db.deleteAttribute(DB_ID, colId, key);
          await sleep(1500);
        } catch (e) {
          console.error(`   ✖ Löschen fehlgeschlagen: ${e.message}`);
        }
      }
      try {
        await createAttribute(colId, key, spec);
        console.log(`   ✔ neu angelegt: ${colId}.${key}`);
      } catch (e) {
        console.error(`   ✖ Anlegen fehlgeschlagen: ${e.message}`);
      }
      await sleep(500);
    }
  }

  // 3: auf "available" warten (max. 3 Minuten)
  console.log("\nWarte auf Attribut-Status 'available' ...");
  const deadline = Date.now() + 180_000;
  let pending = [];
  while (Date.now() < deadline) {
    pending = [];
    for (const [colId, def] of Object.entries(schema)) {
      const states = await getAttributes(colId);
      for (const key of Object.keys(def.attrs)) {
        const status = states.get(key) || "missing";
        if (status !== "available") pending.push(`${colId}.${key}=${status}`);
      }
    }
    if (!pending.length) break;
    console.log(`   … noch offen: ${pending.join(", ")}`);
    await sleep(10_000);
  }

  if (pending.length) {
    console.error(`\n✖ Immer noch hängend: ${pending.join(", ")}`);
    console.error("→ Der Datenbank-Worker verarbeitet die Queue nicht. Bitte Worker-Logs prüfen.");
    process.exit(1);
  }

  // 4: Indexe anlegen
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
