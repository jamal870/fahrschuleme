#!/usr/bin/env node
// Lightweight "meta shell" prerendering: writes a static dist/<route>/index.html
// per public route with the page-specific <title>/<meta description>/
// <link canonical>/OG/Twitter tags baked in, so crawlers and AI systems that
// fetch raw HTML (i.e. that don't execute JavaScript) see the real per-page
// metadata instead of the generic homepage tags for every URL.
//
// This does NOT server-render the page body (the app is a client-rendered
// SPA and stays that way) — only the <head> tags are swapped per route.
// JSON-LD is intentionally left as-is (only the sitewide DrivingSchool
// schema from index.html applies) to keep this step simple and low-risk;
// llms.txt/llms-full.txt separately cover structured facts for AI systems.
//
// Runs after `vite build` (see package.json "build" script). Safe to run
// multiple times; only ever reads dist/index.html as the template and
// writes new files, never mutates other build output.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SEO_ROUTES } from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");
const TEMPLATE_PATH = join(DIST_DIR, "index.html");
const SITE_URL = "https://www.fahrschule-me.ch";

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceOrThrow(html, regex, replacement, label) {
  if (!regex.test(html)) {
    throw new Error(`prerender: expected to find ${label} in the template but didn't — index.html may have changed.`);
  }
  return html.replace(regex, replacement);
}

function buildHtmlForRoute(template, route) {
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);
  const url = `${SITE_URL}${route.path}`;

  let html = template;
  html = replaceOrThrow(html, /<title>[^<]*<\/title>/, `<title>${title}</title>`, "<title>");
  html = replaceOrThrow(
    html,
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${description}" />`,
    'meta[name="description"]',
  );
  html = replaceOrThrow(
    html,
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${title}" />`,
    'meta[property="og:title"]',
  );
  html = replaceOrThrow(
    html,
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${description}" />`,
    'meta[property="og:description"]',
  );
  html = replaceOrThrow(
    html,
    /<meta property="og:url" content="[^"]*" \/>/,
    `<meta property="og:url" content="${url}" />`,
    'meta[property="og:url"]',
  );
  html = replaceOrThrow(
    html,
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${title}" />`,
    'meta[name="twitter:title"]',
  );
  html = replaceOrThrow(
    html,
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${description}" />`,
    'meta[name="twitter:description"]',
  );
  // No <link rel="canonical"> exists in the template yet — insert one right
  // after the description meta tag (mirrors what <Seo> renders client-side).
  html = replaceOrThrow(
    html,
    /(<meta name="description" content="[^"]*" \/>\n)/,
    `$1    <link rel="canonical" href="${url}" />\n`,
    'insertion point for <link rel="canonical">',
  );

  return html;
}

function writeRouteFile(outPath, html) {
  if (outPath === "/") {
    writeFileSync(TEMPLATE_PATH, html);
    return;
  }
  const dir = join(DIST_DIR, outPath.replace(/^\//, ""));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

function main() {
  if (!existsSync(TEMPLATE_PATH)) {
    throw new Error(`prerender: ${TEMPLATE_PATH} not found — run "vite build" first.`);
  }
  const template = readFileSync(TEMPLATE_PATH, "utf-8");

  let written = 0;
  for (const route of SEO_ROUTES) {
    const html = buildHtmlForRoute(template, route);
    writeRouteFile(route.path, html);
    written += 1;
    for (const alias of route.aliases ?? []) {
      // Aliases share the page's title/description but keep the primary
      // path as canonical — build the same html again with the same
      // canonical URL, just written to the alias's own directory.
      writeRouteFile(alias, html);
      written += 1;
    }
  }

  console.log(`prerender: wrote ${written} static meta shells (${SEO_ROUTES.length} routes + aliases) into dist/`);
}

main();
