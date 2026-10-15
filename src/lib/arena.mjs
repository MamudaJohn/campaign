export function wrapIndex(index, length) {
  return length > 0 ? ((index % length) + length) % length : 0;
}

export function relativePosition(index, active, length) {
  let distance = wrapIndex(index - active, length);
  if (distance > length / 2) distance -= length;
  return distance;
}

export function candidateDestination(candidate) {
  const fallback = `?candidate=${encodeURIComponent(candidate.id)}`;
  if (!candidate.link?.trim()) return fallback;
  try {
    const url = new URL(candidate.link);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : fallback;
  } catch { return fallback; }
}
