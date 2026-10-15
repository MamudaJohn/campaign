import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { campaign } from '../src/data/campaign.js';
import { site } from '../src/data/site.mjs';
import { candidateDestination } from '../src/lib/arena.mjs';
import { indexableCandidates, pageMetadata } from '../src/lib/seo.mjs';

const home = await readFile('dist/index.html', 'utf8');
assert.match(home, /data-page="home" data-candidate-id=""/);
assert.match(home, /data-render-mode="light"/);
assert.match(home, /Get to know your candidates/);
assert.match(home, /John Mamuda/);
assert.match(home, /rel="canonical" href="https:\/\/mamudajohn\.com\/"/);
assert.doesNotMatch(home, /<form|<input|<canvas/);
assert.ok(!home.includes('<!-- seo:start -->'));
for (const candidate of campaign.candidates) {
  const html = await readFile(`dist/candidates/${candidate.id}/index.html`, 'utf8');
  assert.ok(html.includes(`data-candidate-id="${candidate.id}"`));
  assert.ok(html.includes(`rel="canonical" href="${pageMetadata(campaign, candidate).canonical}"`));
  const schema = JSON.parse(html.match(/id="campaign-structured-data" type="application\/ld\+json">([\s\S]+?)<\/script>/)[1]);
  assert.equal(schema.mainEntity.name, candidate.name);
  assert.match(html, /CANDIDATE PROFILE/);
}
const notFound = await readFile('dist/404.html', 'utf8');
assert.match(notFound, /noindex, follow/);
assert.match(notFound, /PROFILE NOT FOUND/);
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const expectedUrls = [site.url, ...indexableCandidates(campaign).map(candidate => new URL(candidateDestination(candidate), site.url).href)];
assert.equal((sitemap.match(/<loc>/g) || []).length, expectedUrls.length);
for (const url of expectedUrls) assert.ok(sitemap.includes(`<loc>${url}</loc>`));
assert.match(await readFile('dist/robots.txt', 'utf8'), /Sitemap: https:\/\/mamudajohn\.com\/sitemap\.xml/);
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const entry = Object.values(manifest).find(item => item.isEntry);
const initial = new Set();
function collect(item) { initial.add(item.file); for (const key of item.imports || []) collect(manifest[key]); }
collect(entry);
const scene = Object.values(manifest).find(item => item.src === 'src/ArenaScene.jsx');
assert.ok(scene?.isDynamicEntry, 'The WebGL scene must remain deferred');
assert.ok(!initial.has(scene.file), 'Initial/mobile JavaScript must not import the 3D engine');
let bytes = 0, gzip = 0;
for (const file of initial) { const data = await readFile(`dist/${file}`); bytes += data.length; gzip += gzipSync(data).length; }
assert.ok(gzip < 120000, `Initial JavaScript exceeds 120 kB gzip: ${gzip}`);
for (const css of entry.css || []) assert.ok(!(await readFile(`dist/${css}`, 'utf8')).includes('@import'), 'Fonts must not block the CSS via @import');
console.log(`Production checks passed: pre-rendered candidate pages, metadata, canonical sitemap, 404, and deferred 3D. Initial JS: ${(bytes / 1000).toFixed(1)} kB / ${(gzip / 1000).toFixed(1)} kB gzip. 3D chunk excluded from initial imports: ${scene.file}`);
