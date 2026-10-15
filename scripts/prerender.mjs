import { build } from 'esbuild';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { campaign } from '../src/data/campaign.js';
import { site } from '../src/data/site.mjs';
import { candidateDestination } from '../src/lib/arena.mjs';
import { escapeHtml, indexableCandidates, metadataTags, pageMetadata } from '../src/lib/seo.mjs';

export async function prerender() {
  if (new Set(campaign.candidates.map(candidate => candidate.id)).size !== campaign.candidates.length) throw new Error('Every candidate must have a unique id in campaign.js');
  const root = process.cwd();
  const directory = path.join(root, '.verification');
  await mkdir(directory, { recursive: true });
  const output = path.join(directory, `prerender-${Date.now()}.mjs`);
  try {
    await build({ absWorkingDir: root, entryPoints: ['src/Experience.jsx'], outfile: output, bundle: true, platform: 'node', format: 'esm', packages: 'external', loader: { '.css': 'empty' }, logLevel: 'silent' });
    const { default: Experience } = await import(pathToFileURL(output).href);
    const template = await readFile(path.join(root, 'dist/index.html'), 'utf8');
    const renderPage = async (file, candidate = null, notFound = false) => {
      const candidateId = notFound ? '__not-found__' : candidate?.id || '';
      const markup = renderToString(React.createElement(Experience, { candidateId: candidateId || null }));
      let html = template.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, metadataTags(pageMetadata(campaign, candidate, notFound)));
      if (!html.includes('rel="canonical"')) throw new Error('SEO head insertion failed');
      html = html.replace('<div id="root"></div>', `<div id="root" data-page="${notFound ? '404' : candidate ? 'candidate' : 'home'}" data-candidate-id="${escapeHtml(candidateId)}">${markup}</div>`);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, html, 'utf8');
    };
    await renderPage(path.join(root, 'dist/index.html'));
    for (const candidate of campaign.candidates) {
      if (!/^[a-z0-9][a-z0-9-]*$/i.test(candidate.id)) throw new Error(`Candidate id must be a unique URL slug: ${candidate.id}`);
      await renderPage(path.join(root, 'dist/candidates', candidate.id, 'index.html'), candidate);
    }
    await renderPage(path.join(root, 'dist/404.html'), null, true);
    const urls = [site.url, ...indexableCandidates(campaign).map(candidate => new URL(candidateDestination(candidate), site.url).href)];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `\n  <url><loc>${escapeHtml(url)}</loc></url>`).join('')}\n</urlset>\n`;
    await writeFile(path.join(root, 'dist/sitemap.xml'), sitemap);
    await writeFile(path.join(root, 'dist/robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site.url).href}\n`);
    console.log(`Pre-rendered homepage, ${campaign.candidates.length} candidate detail pages, and 404. Sitemap contains ${urls.length} canonical URLs for ${site.url}`);
  } finally { await unlink(output).catch(() => {}); }
}
