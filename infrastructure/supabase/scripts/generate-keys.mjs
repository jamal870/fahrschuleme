#!/usr/bin/env node
/**
 * Erzeugt JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY und SECRET_KEY_BASE
 * für den self-hosted Supabase-Stack.
 *
 *   node scripts/generate-keys.mjs
 *
 * Die Ausgabe direkt in /opt/supabase/.env übernehmen.
 */
import crypto from "node:crypto";

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const sign = (payload, secret) => {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const data = `${header}.${body}`;
  const sig = b64url(crypto.createHmac("sha256", secret).update(data).digest());
  return `${data}.${sig}`;
};

const jwtSecret = crypto.randomBytes(32).toString("base64").slice(0, 43);
const secretKeyBase = crypto.randomBytes(48).toString("hex").slice(0, 64);

const iat = Math.floor(Date.now() / 1000);
const exp = iat + 60 * 60 * 24 * 365 * 10; // 10 Jahre

const anon = sign({ role: "anon", iss: "supabase", iat, exp }, jwtSecret);
const service = sign({ role: "service_role", iss: "supabase", iat, exp }, jwtSecret);

console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`ANON_KEY=${anon}`);
console.log(`SERVICE_ROLE_KEY=${service}`);
console.log(`SECRET_KEY_BASE=${secretKeyBase}`);
console.log(`POSTGRES_PASSWORD=${crypto.randomBytes(24).toString("base64url")}`);
