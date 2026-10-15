import { site } from '../data/site.mjs';
import { candidateDestination } from './arena.mjs';

const identity = candidate => JSON.stringify([candidate.name, candidate.position, candidate.statement, candidate.detail, candidate.image].map(value => value?.trim()));

export function indexableCandidates(config) {
  const seen = new Set();
  return config.candidates.filter(candidate => {
    const key = identity(candidate);
    if (!candidate.configured || seen.has(key)) return false;
    seen.add(key); return true;
  });
}

export function pageMetadata(config, candidate = null, notFound = false) {
  const canonicalCandidate = candidate ? config.candidates.find(item => identity(item) === identity(candidate)) || candidate : null;
  const canonical = new URL(candidate ? candidateDestination(canonicalCandidate) : '/', site.url).href;
  const title = notFound ? `Page not found | ${site.name}` : candidate ? `${candidate.name} for ${candidate.position} | ${site.name}` : site.title;
  const description = candidate ? `Meet ${candidate.name}, candidate for ${candidate.position}. ${candidate.statement.trim()}`.slice(0, 160) : site.description;
  const image = new URL(candidate?.image || site.image, site.url).href;
  const robots = notFound || (candidate && !candidate.configured) ? 'noindex, follow' : 'index, follow, max-image-preview:large';
  const structuredData = notFound ? null : {
    '@context': 'https://schema.org',
    '@type': candidate ? 'ProfilePage' : 'WebSite',
    name: candidate ? `${candidate.name} - ${candidate.position}` : site.name,
    url: canonical,
    description,
    ...(candidate ? { mainEntity: { '@type': 'Person', name: candidate.name, description: `Candidate for ${candidate.position}`, image, url: canonical } } : {}),
  };
  return { title, description, canonical, image, robots, structuredData };
}

export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export const safeJson = value => JSON.stringify(value).replaceAll('<', '\\u003c');

export function metadataTags(metadata) {
  const e = escapeHtml;
  return `<title>${e(metadata.title)}</title>
<meta name="description" content="${e(metadata.description)}"/>
<meta name="robots" content="${e(metadata.robots)}"/>
<link rel="canonical" href="${e(metadata.canonical)}"/>
<meta property="og:type" content="website"/>
<meta property="og:site_name" content="${e(site.name)}"/>
<meta property="og:title" content="${e(metadata.title)}"/>
<meta property="og:description" content="${e(metadata.description)}"/>
<meta property="og:url" content="${e(metadata.canonical)}"/>
<meta property="og:image" content="${e(metadata.image)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${e(metadata.title)}"/>
<meta name="twitter:description" content="${e(metadata.description)}"/>
<meta name="twitter:image" content="${e(metadata.image)}"/>
${metadata.structuredData ? `<script id="campaign-structured-data" type="application/ld+json">${safeJson(metadata.structuredData)}</script>` : ''}`;
}
