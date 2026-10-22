#!/usr/bin/env node
// Regression check against the actual prerendered HTML, not only source props.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SEO_ROUTES } from './seo-routes.mjs';

const base = 'https://www.fahrschule-me.ch';
const canonicalPath = (path) => path === '/' ? '/' : path.replace(/\/+$/, '') + '/';
const known = new Map();
for (const route of SEO_ROUTES) {
  for (const path of [route.path, ...(route.aliases ?? [])]) {
    known.set(path, canonicalPath(route.path));
    known.set(canonicalPath(path), canonicalPath(route.path));
  }
}
let count = 0;
for (const route of SEO_ROUTES) {
  for (const path of [route.path, ...(route.aliases ?? [])]) {
    const file = path === '/' ? 'dist/index.html' : `dist${path}/index.html`;
    const html = readFileSync(file, 'utf8');
    const links = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => tag);
    const canonicals = links.filter(tag => /rel="canonical"/.test(tag));
    assert.equal(canonicals.length, 1, `${path}: exactly one canonical required`);
    assert.ok(canonicals[0].includes(`href="${base}${canonicalPath(route.path)}"`), `${path}: canonical must be final slash URL`);
    assert.ok(html.includes(`property="og:url" content="${base}${canonicalPath(route.path)}"`), `${path}: Open Graph URL mismatch`);
    // Check public navigation, including query strings and fragments. Keep
    // private app routes, external links and static asset paths out of scope.
    for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
      if (!(href.startsWith('/') && !href.startsWith('//')) && !href.startsWith(base + '/')) continue;
      const url = new URL(href, base);
      if (known.has(url.pathname)) {
        assert.equal(url.pathname, known.get(url.pathname), `${path}: indirect internal link ${href}`);
      }
    }
    count++;
  }
}
const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
const locs = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, url]) => url);
assert.deepEqual(new Set(locs), new Set(SEO_ROUTES.map(route => base + canonicalPath(route.path))), 'Sitemap must contain exactly the canonical public routes, without aliases');
console.log(`SEO checks passed: ${count} HTML files, ${locs.length} canonical sitemap URLs, direct public links.`);
