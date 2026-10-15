import assert from 'node:assert/strict';
import { mkdir, unlink } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { build } from 'esbuild';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, '.verification');
await mkdir(directory, { recursive: true });
const output = path.join(directory, `experience-${Date.now()}.mjs`);
try {
  await build({ entryPoints: [path.join(root, 'src/Experience.jsx')], outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external', loader: { '.css': 'empty' }, logLevel: 'silent' });
  const { default: Experience } = await import(pathToFileURL(output).href);
  const home = renderToString(React.createElement(Experience));
  assert.match(home, /Your future/);
  assert.match(home, /John Mamuda/);
  assert.match(home, /Navigation guide/);
  assert.match(home, /Scene studio/);
  assert.match(home, /Visual quality: cinematic/);
  assert.match(home, /fallback-buildings/);
  assert.match(home, /VIRTUAL AUDIENCE/);
  assert.equal((home.match(/class="candidate-card"/g) || []).length, 5);
  assert.match(home, /href="\?candidate=john-mamuda"/);
  globalThis.location = { search: '?candidate=john-mamuda' };
  const profile = renderToString(React.createElement(Experience));
  assert.match(profile, /CANDIDATE DOSSIER/);
  assert.match(profile, /John Mamuda/);
  assert.match(profile, /ICT Director/);
  assert.match(profile, /Return to the revolving stage/);
  assert.doesNotMatch(profile, /class="candidate-card"/);
  console.log('Homepage, five candidate slide templates, guidance, controls, and linked candidate profile render successfully.');
} finally {
  delete globalThis.location;
  await unlink(output).catch(() => {});
}
