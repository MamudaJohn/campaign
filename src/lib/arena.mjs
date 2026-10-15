export function wrapIndex(index, length) {
  return length > 0 ? ((index % length) + length) % length : 0;
}

export function relativePosition(index, active, length) {
  let distance = wrapIndex(index - active, length);
  if (distance > length / 2) distance -= length;
  return distance;
}

export function candidateDestination(candidate) {
  return `/candidates/${encodeURIComponent(candidate.id)}/`;
}

// Keep previously shared query-string profile links working.
export function candidateIdFromLocation(location) {
  const query = new URLSearchParams(location?.search || '').get('candidate');
  if (query) return query;
  const match = (location?.pathname || '').match(/\/candidates\/([^/]+)\/?$/);
  try { return match ? decodeURIComponent(match[1]) : null; } catch { return null; }
}

// External destinations are available only from the candidate's detail page.
export function candidateCampaignLink(candidate) {
  if (!candidate.link?.trim()) return '';
  try {
    const url = new URL(candidate.link.trim());
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
