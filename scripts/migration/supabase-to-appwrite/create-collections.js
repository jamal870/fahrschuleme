/**
 * Legt alle Appwrite-Collections + Attribute für fahrschule-me-prod an.
 *
 * Nutzung (lokal oder auf dem VPS):
 *   npm i node-appwrite
 *   APPWRITE_ENDPOINT=https://api.fahrschule-me.ch/v1 \
 *   APPWRITE_PROJECT=6a773fb100114c0e82c8 \
 *   APPWRITE_API_KEY=<dein-api-key> \
 *   node create-collections.js
 */

import { Client, Databases, Permission, Role, ID } from "node-appwrite";

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

async function appwriteGet(path) {
  const response = await fetch(`${endpoint}${path}`, {
    headers: {
      "X-Appwrite-Project": project,
      "X-Appwrite-Key": apiKey,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Appwrite GET ${path}: HTTP ${response.status} ${body}`);
  }

  return response.json();
}

async function getAttributeStates(colId) {
  const result = await appwriteGet(
    `/databases/${encodeURIComponent(DB_ID)}/collections/${encodeURIComponent(colId)}/attributes?queries[]=${encodeURIComponent('limit(100)')}`,
  );
  return new Map((result.attributes || []).map((attribute) => [attribute.key, attribute.status]));
}

/** Schema-Definition: Supabase -> Appwrite */
const collections = [
  {
    id: "bookings",
    name: "Bookings",
    // Nur Server (API-Key) darf lesen/schreiben – Buchungen laufen über Functions
    permissions: [],
    attributes: [
      ["string", "bookingType", 64, true],
      ["string", "firstName", 128, true],
      ["string", "lastName", 128, true],
      ["string", "address", 256, false],
      ["string", "postalCode", 16, false],
      ["string", "city", 128, false],
      ["string", "birthDate", 32, false],
      ["string", "faNumber", 64, false],
      ["email", "email", null, true],
      ["string", "phone", 64, false],
      ["string", "paymentMethod", 32, false],
      ["double", "totalPrice", null, false],
      ["string", "paymentStatus", 32, false],
      ["string", "status", 32, false],
      ["string", "stripeSessionId", 255, false],
      ["string", "notes", 5000, false],
    ],
    indexes: [
      ["idx_email", "key", ["email"]],
      ["idx_status", "key", ["status"]],
    ],
  },
  {
    id: "booking_items",
    name: "Booking Items",
    permissions: [],
    attributes: [
      ["string", "bookingId", 64, true],
      ["string", "courseDateId", 64, false],
      ["string", "fahrstundenServiceId", 64, false],
      ["string", "fahrstundenPackageId", 64, false],
      ["string", "instructor", 128, false],
    ],
    indexes: [
      ["idx_booking", "key", ["bookingId"]],
      ["idx_coursedate", "key", ["courseDateId"]],
    ],
  },
  {
    id: "course_dates",
    name: "Course Dates",
    // Öffentlich lesbar (Kurstermine auf der Website)
    permissions: [Permission.read(Role.any())],
    attributes: [
      ["integer", "part", null, false],
      ["string", "day", 32, false],
      ["string", "date", 32, true],
      ["string", "time", 64, false],
      ["string", "location", 255, false],
      ["string", "instructor", 128, false],
      ["string", "instructorNumber", 64, false],
      ["double", "price", null, false],
      ["integer", "spotsAvailable", null, true],
      ["string", "gcalEventId", 255, false],
      ["string", "courseType", 64, false],
    ],
    indexes: [["idx_date", "key", ["date"]]],
  },
  {
    id: "course_signatures",
    name: "Course Signatures",
    permissions: [],
    attributes: [
      ["string", "courseDateId", 64, true],
      ["string", "bookingId", 64, true],
      ["string", "signatureData", 100000, false],
      ["boolean", "present", null, false],
      ["datetime", "signedAt", null, false],
    ],
    indexes: [["idx_course", "key", ["courseDateId"]]],
  },
  {
    id: "waitlist",
    name: "Waitlist",
    permissions: [],
    attributes: [
      ["string", "courseDateId", 64, false],
      ["string", "firstName", 128, true],
      ["string", "lastName", 128, true],
      ["email", "email", null, true],
      ["string", "phone", 64, false],
      ["string", "notes", 2000, false],
      ["string", "status", 32, false],
      ["datetime", "notifiedAt", null, false],
    ],
    indexes: [["idx_course", "key", ["courseDateId"]]],
  },
  {
    id: "team_members",
    name: "Team Members",
    permissions: [Permission.read(Role.any())],
    attributes: [
      ["string", "name", 128, true],
      ["string", "role", 128, false],
      ["string", "qualification", 1000, false],
      ["string", "hobbies", 1000, false],
      ["string", "character", 1000, false],
      ["string", "motto", 500, false],
      ["string", "phone", 64, false],
      ["boolean", "isVisible", null, false],
      ["integer", "sortOrder", null, false],
    ],
  },
  {
    id: "promotions",
    name: "Promotions",
    permissions: [Permission.read(Role.any())],
    attributes: [
      ["string", "title", 255, true],
      ["string", "description", 5000, false],
      ["string", "badge", 64, false],
      ["boolean", "isActive", null, false],
      ["integer", "sortOrder", null, false],
      ["string", "validUntil", 32, false],
    ],
  },
  {
    id: "site_content",
    name: "Site Content",
    permissions: [Permission.read(Role.any())],
    attributes: [
      ["string", "key", 128, true],
      ["string", "value", 20000, false],
    ],
    indexes: [["idx_key", "unique", ["key"]]],
  },
  {
    id: "fahrstunden_services",
    name: "Fahrstunden Services",
    permissions: [Permission.read(Role.any())],
    attributes: [
      ["string", "name", 255, true],
      ["string", "description", 2000, false],
      ["double", "price", null, false],
      ["integer", "durationMinutes", null, false],
      ["string", "category", 64, false],
      ["boolean", "isActive", null, false],
      ["integer", "sortOrder", null, false],
    ],
  },
  {
    id: "fahrstunden_packages",
    name: "Fahrstunden Packages",
    permissions: [Permission.read(Role.any())],
    attributes: [
      ["string", "name", 255, true],
      ["string", "description", 2000, false],
      ["double", "price", null, false],
      ["integer", "lessons", null, false],
      ["string", "category", 64, false],
      ["boolean", "isActive", null, false],
      ["integer", "sortOrder", null, false],
    ],
  },
  {
    id: "email_settings",
    name: "Email Settings",
    permissions: [],
    attributes: [
      ["string", "fromName", 128, false],
      ["email", "replyToEmail", null, false],
      // > 16383 => wird von Appwrite als TEXT gespeichert (kein Row-Size-Limit)
      ["string", "footerSignature", 20000, false],
      ["string", "bankInfo", 20000, false],
      ["string", "mgkGreetingExtra", 20000, false],
      ["string", "mgkMeetingPoint", 20000, false],
      ["string", "mgkImportantNotes", 20000, false],
      ["string", "mgkCancellationPolicy", 20000, false],
      ["string", "fahrstundenGreetingExtra", 20000, false],
      ["string", "fahrstundenMeetingPoint", 20000, false],
      ["string", "fahrstundenImportantNotes", 20000, false],
      ["string", "reminderExtraNote", 20000, false],
    ],
  },
  {
    id: "user_roles",
    name: "User Roles",
    permissions: [],
    attributes: [
      ["string", "userId", 64, true],
      ["string", "role", 32, true],
    ],
    indexes: [["idx_user", "key", ["userId"]]],
  },
];

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

async function run() {
  const wantedIndexes = [];

  for (const col of collections) {
    try {
      await db.createCollection(DB_ID, col.id, col.name, col.permissions, false, true);
      console.log(`✔ Collection erstellt: ${col.id}`);
    } catch (e) {
      if (e.code === 409) console.log(`• Collection existiert bereits: ${col.id}`);
      else throw e;
    }

    for (const attr of col.attributes) {
      try {
        await createAttribute(col.id, attr);
        console.log(`   ✔ Attribut ${col.id}.${attr[1]}`);
      } catch (e) {
        if (e.code === 409) console.log(`   • Attribut existiert: ${col.id}.${attr[1]}`);
        else console.error(`   ✖ ${col.id}.${attr[1]}: ${e.message}`);
      }
      await sleep(250);
    }

    if (col.indexes?.length) {
      for (const [key, type, attrs] of col.indexes) {
        wantedIndexes.push({ colId: col.id, key, type, attrs });
      }
    }
  }

  // Nicht blind warten: den echten Status der benötigten Attribute abfragen.
  // So werden dauerhafte Worker-/Attributfehler sofort sichtbar.
  if (wantedIndexes.length) {
    console.log(`\nPrüfe und erstelle ${wantedIndexes.length} Indexe ...`);
    const statesByCollection = new Map();

    for (const { colId } of wantedIndexes) {
      if (!statesByCollection.has(colId)) {
        statesByCollection.set(colId, await getAttributeStates(colId));
      }
    }

    for (const { colId, key, type, attrs } of wantedIndexes) {
      const states = statesByCollection.get(colId);
      const blocked = attrs
        .map((attribute) => ({ attribute, status: states?.get(attribute) || "missing" }))
        .filter(({ status }) => status !== "available");

      if (blocked.length) {
        console.error(
          `   ✖ Index ${colId}.${key} blockiert: ${blocked.map(({ attribute, status }) => `${attribute}=${status}`).join(", ")}`,
        );
        continue;
      }

      try {
        await db.createIndex(DB_ID, colId, key, type, attrs);
        console.log(`   ✔ Index ${colId}.${key} erstellt`);
      } catch (e) {
        if (e.code === 409) {
          console.log(`   • Index existiert: ${colId}.${key}`);
        } else {
          console.error(`   ✖ Index ${colId}.${key}: [${e.code || "ohne Code"}] ${e.message}`);
        }
      }
    }
  }

  console.log("\nFertig. Alle Collections angelegt.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
