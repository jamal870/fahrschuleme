#!/usr/bin/env node
// Real static prerendering: writes a static dist/<route>/index.html per
// public route with the actual page body (H1, headings, paragraphs, FAQs)
// baked in — not just a per-page <head> shell around an empty
// <div id="root">. Crawlers and AI systems that fetch raw HTML without
// executing JavaScript now see the same content a browser shows.
//
// How: `vite build --ssr src/entry-server.tsx --outDir dist-ssr` (run by
// the "build" script before this file) compiles a small server-rendering
// entry point. This script imports it and calls renderRoute(path) for
// every route in scripts/seo-routes.mjs, using React's
// renderToStaticMarkup + react-helmet-async's SSR context to get the real
// page body and the real <title>/<meta>/<link>/<script> tags that page
// would set client-side via <Seo>. Those replace the generic homepage
// tags and the empty <div id="root"> for that route's static HTML file.
//
// Effects never run during renderToStaticMarkup, so pages that fetch data
// on mount (Supabase, react-query) render their synchronous default state.
// That's why only routes built on static props are prerendered with real
// content — see src/entry-server.tsx for exactly which ones.
//
// Defensive by design: if SSR rendering throws for a route (or the SSR
// bundle is missing), that route falls back to the old meta-only shell
// instead of failing the whole build.
//
// Runs after `vite build` (see package.json "build" script). Safe to run
// multiple times; only ever reads dist/index.html as the template and
// writes new files, never mutates other build output.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { SEO_ROUTES } from "./seo-routes.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, "..", "dist");
const SSR_ENTRY = join(__dirname, "..", "dist-ssr", "entry-server.js");
const TEMPLATE_PATH = join(DIST_DIR, "index.html");
const SITE_URL = "https://www.fahrschule-me.ch";

// Tags that <Seo>/Helmet re-supplies per route. Stripped from the sitewide
// template before inserting the route-specific versions, so we don't end
// up with two <title> tags, two og:title tags, etc. Everything else in
// <head> (icons, robots default, geo tags, llms.txt links, gtag script,
// sitewide DrivingSchool JSON-LD) is left untouched.
const REPLACED_HEAD_TAGS = [
  /<title>[^<]*<\/title>\n?/,
  /<meta name="description" content="[^"]*" \/>\n?/,
  /<meta property="og:title" content="[^"]*" \/>\n?/,
  /<meta property="og:description" content="[^"]*" \/>\n?/,
  /<meta property="og:url" content="[^"]*" \/>\n?/,
  /<meta property="og:image" content="[^"]*" \/>\n?/,
  /<meta name="twitter:title" content="[^"]*" \/>\n?/,
  /<meta name="twitter:description" content="[^"]*" \/>\n?/,
  /<meta name="twitter:image" content="[^"]*" \/>\n?/,
];

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

// Old, meta-tags-only shell (title/description/canonical/OG/Twitter swapped
// via string replace, empty <div id="root">). Used as a fallback when real
// SSR isn't available or throws for a given route.
function buildMetaOnlyHtml(template, route) {
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
  html = replaceOrThrow(
    html,
    /(<meta name="description" content="[^"]*" \/>\n)/,
    `$1    <link rel="canonical" href="${url}" />\n`,
    'insertion point for <link rel="canonical">',
  );
  return html;
}

// Real SSR shell: strips the sitewide title/OG/Twitter tags and inserts the
// route's actual Helmet-rendered head tags plus its real rendered body.
function buildSsrHtml(template, route, ssr) {
  let html = template;
  for (const regex of REPLACED_HEAD_TAGS) {
    html = html.replace(regex, "");
  }

  const headExtra = [ssr.head.title, ssr.head.meta, ssr.head.link, ssr.head.script].filter(Boolean).join("\n    ");
  html = replaceOrThrow(html, /<\/head>/, `    ${headExtra}\n  </head>`, "</head>");

  html = replaceOrThrow(html, /<div id="root"><\/div>/, `<div id="root">${ssr.bodyHtml}</div>`, '<div id="root">');
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

async function loadRenderRoute() {
  if (!existsSync(SSR_ENTRY)) {
    console.warn(`prerender: ${SSR_ENTRY} not found — falling back to meta-only shells for all routes.`);
    return null;
  }
  try {
    const mod = await import(pathToFileURL(SSR_ENTRY).href);
    return mod.renderRoute;
  } catch (err) {
    console.warn(`prerender: failed to load SSR bundle (${err.message}) — falling back to meta-only shells for all routes.`);
    return null;
  }
}

async function main() {
  if (!existsSync(TEMPLATE_PATH)) {
    throw new Error(`prerender: ${TEMPLATE_PATH} not found — run "vite build" first.`);
  }
  const template = readFileSync(TEMPLATE_PATH, "utf-8");
  const renderRoute = await loadRenderRoute();

  let written = 0;
  let ssrCount = 0;
  for (const route of SEO_ROUTES) {
    const paths = [route.path, ...(route.aliases ?? [])];
    for (const outPath of paths) {
      let html = null;
      if (renderRoute) {
        try {
          // Always render the canonical path, even for alias output files —
          // aliases share the same content and canonical URL (see below).
          const ssr = renderRoute(route.path);
          html = buildSsrHtml(template, route, ssr);
          ssrCount += 1;
        } catch (err) {
          console.warn(`prerender: SSR render failed for "${outPath}" (${err.message}) — using meta-only shell.`);
        }
      }
      if (!html) {
        html = buildMetaOnlyHtml(template, route);
      }
      writeRouteFile(outPath, html);
      written += 1;
    }
  }

  console.log(
    `prerender: wrote ${written} static HTML files (${SEO_ROUTES.length} routes + aliases), ${ssrCount} with real SSR content.`,
  );
}

main();
