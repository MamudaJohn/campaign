export function wrapIndex(index, length) {
  return length > 0 ? ((index % length) + length) % length : 0;
}

export function relativePosition(index, active, length) {
  let distance = wrapIndex(index - active, length);
  if (distance > length / 2) distance -= length;
  return distance;
}

export function candidateDestination(candidate) {
  return `?candidate=${encodeURIComponent(candidate.id)}`;
}

// External destinations are available only from the candidate's detail page.
export function candidateCampaignLink(candidate) {
  if (!candidate.link?.trim()) return '';
  try {
    const url = new URL(candidate.link.trim());
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}
