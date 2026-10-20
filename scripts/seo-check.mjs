#!/usr/bin/env node
// SEO-Prüfung für alle URLs der Sitemap. Keine Abhängigkeiten (Node 18+).
//
// Verwendung:
//   node scripts/seo-check.mjs                      -> prüft die Live-Seite (Sitemap von www.fahrschule-me.ch)
//   node scripts/seo-check.mjs --base https://deploy-preview-123--fahrschuleme.netlify.app
//   node scripts/seo-check.mjs --dist                -> prüft den lokalen Build in dist/ (nach `bun run build`)
//
// Geprüft wird je URL: Status 200 ohne Weiterleitung, Canonical == abgerufene
// URL, genau eine H1, JSON-LD vorhanden und parsebar, Title <= 60 Zeichen,
// Description 120-160 Zeichen; über alle URLs: keine doppelten Titles/
// Descriptions und keine Sitemap-URL, deren Canonical woanders hinzeigt.

import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const useDist = args.includes("--dist");
const baseArg = args[args.indexOf("--base") + 1];
const BASE = (args.includes("--base") && baseArg ? baseArg : "https://www.fahrschule-me.ch").replace(/\/$/, "");
const CANONICAL_HOST = "https://www.fahrschule-me.ch";
const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");

const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;

function distPathFor(url) {
  const path = new URL(url).pathname.replace(/\/$/, "");
  return path === "" ? join(DIST, "index.html") : join(DIST, path, "index.html");
}

// Liefert { status, redirected, finalUrl, html } – aus dist/ oder per fetch.
async function load(url) {
  if (useDist) {
    const file = distPathFor(url);
    if (!existsSync(file)) return { status: 404, redirected: false, finalUrl: url, html: "" };
    return { status: 200, redirected: false, finalUrl: url, html: readFileSync(file, "utf-8") };
  }
  const res = await fetch(url, { redirect: "manual", headers: { "user-agent": "seo-check/1.0" } });
  const redirected = res.status >= 300 && res.status < 400;
  const html = redirected ? "" : await res.text();
  return { status: res.status, redirected, finalUrl: redirected ? res.headers.get("location") ?? "" : url, html };
}

async function loadSitemap() {
  const xml = useDist ? readFileSync(join(DIST, "sitemap.xml"), "utf-8") : await (await fetch(`${BASE}/sitemap.xml`)).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  if (locs.length === 0) throw new Error("Sitemap enthält keine <loc>-Einträge");
  return locs;
}

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const attr = (html, re) => { const m = html.match(re); return m ? decode(m[1]) : null; };

function analyse(html) {
  const title = attr(html, /<title>([^<]*)<\/title>/);
  const description = attr(html, /<meta name="description" content="([^"]*)"/);
  const canonical = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const ogUrl = attr(html, /<meta property="og:url" content="([^"]*)"/);
  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);
  const h1Count = (html.match(/<h1[\s>]/gi) || []).length;
  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const ldErrors = [];
  const ldTypes = [];
  for (const raw of ldBlocks) {
    try {
      const obj = JSON.parse(raw);
      const list = Array.isArray(obj) ? obj : obj["@graph"] ? obj["@graph"] : [obj];
      for (const o of list) ldTypes.push(o["@type"] ?? "?");
    } catch (e) { ldErrors.push(e.message); }
  }
  return { title, description, canonical, ogUrl, noindex, h1Count, ldCount: ldBlocks.length, ldErrors, ldTypes };
}

const problems = [];
const rows = [];
const note = (url, msg) => problems.push(`${url}  ${msg}`);

const sitemapUrls = await loadSitemap();
console.log(`${useDist ? "dist/" : BASE} – ${sitemapUrls.length} Sitemap-URLs\n`);

for (const smUrl of sitemapUrls) {
  // Sitemap nennt immer die kanonische Domain; gegen Preview/Dist mit BASE abrufen.
  const url = smUrl.replace(CANONICAL_HOST, BASE);
  let r;
  try { r = await load(url); } catch (e) { note(smUrl, `Abruf fehlgeschlagen: ${e.message}`); continue; }
  if (r.redirected) { note(smUrl, `Weiterleitung ${r.status} -> ${r.finalUrl}`); continue; }
  if (r.status !== 200) { note(smUrl, `Status ${r.status}`); continue; }
  const a = analyse(r.html);
  rows.push({ url: smUrl, ...a });

  if (a.noindex) note(smUrl, "noindex gesetzt");
  if (a.canonical !== smUrl) note(smUrl, `Canonical weicht ab: ${a.canonical}`);
  if (a.ogUrl && a.ogUrl !== smUrl) note(smUrl, `og:url weicht ab: ${a.ogUrl}`);
  if (a.h1Count !== 1) note(smUrl, `${a.h1Count} H1 (erwartet 1)`);
  if (a.ldCount === 0) note(smUrl, "kein JSON-LD");
  for (const e of a.ldErrors) note(smUrl, `JSON-LD nicht parsebar: ${e}`);
  if (!a.title) note(smUrl, "kein Title");
  else if (a.title.length > TITLE_MAX) note(smUrl, `Title ${a.title.length} Zeichen (> ${TITLE_MAX}): ${a.title}`);
  if (!a.description) note(smUrl, "keine Description");
  else if (a.description.length < DESC_MIN || a.description.length > DESC_MAX) note(smUrl, `Description ${a.description.length} Zeichen (Ziel ${DESC_MIN}-${DESC_MAX})`);
}

// Dubletten
const byTitle = new Map(); const byDesc = new Map();
for (const r of rows) {
  if (r.title) byTitle.set(r.title, [...(byTitle.get(r.title) ?? []), r.url]);
  if (r.description) byDesc.set(r.description, [...(byDesc.get(r.description) ?? []), r.url]);
}
for (const [t, urls] of byTitle) if (urls.length > 1) problems.push(`Doppelter Title "${t}": ${urls.join(", ")}`);
for (const [d, urls] of byDesc) if (urls.length > 1) problems.push(`Doppelte Description: ${urls.join(", ")}`);

// Tabelle
console.log("Status  H1  LD  Title  Desc  URL");
for (const r of rows) {
  const flag = r.canonical === r.url ? " " : "!";
  console.log(`200 ${flag}   ${r.h1Count}   ${r.ldCount}   ${String(r.title?.length ?? "-").padStart(3)}    ${String(r.description?.length ?? "-").padStart(3)}  ${r.url}`);
}

console.log(`\n${problems.length === 0 ? "OK – keine Probleme." : `${problems.length} Problem(e):`}`);
for (const p of problems) console.log("  - " + p);
process.exit(problems.length === 0 ? 0 : 1);
