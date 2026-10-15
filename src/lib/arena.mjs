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

export function safeImage(value) {
  if (typeof value !== 'string') return '';
  if (/^data:image\/(png|jpeg|webp|gif);base64,/i.test(value)) return value;
  if (/^\/(?!\/)/.test(value) && !value.includes('\\')) return value;
  try { return ['http:', 'https:'].includes(new URL(value).protocol) ? value : ''; } catch { return ''; }
}

export function restoreConfig(value, defaults) {
  if (!value || !Array.isArray(value.candidates)) return defaults;
  const text = (value, fallback, limit) => typeof value === 'string' && value.trim() ? value.trim().slice(0, limit) : fallback;
  return {
    ...defaults,
    themeImage: safeImage(value.themeImage),
    candidates: defaults.candidates.map(original => {
      const saved = value.candidates.find(candidate => candidate?.id === original.id);
      if (!saved) return original;
      return { ...original,
        name: text(saved.name, original.name, 80), position: text(saved.position, original.position, 80),
        statement: text(saved.statement, original.statement, 240), detail: text(saved.detail, original.detail, 1800),
        image: safeImage(saved.image), link: typeof saved.link === 'string' ? saved.link.slice(0, 2048) : '',
        initials: text(saved.initials, original.initials, 3), configured: Boolean(saved.configured),
      };
    }),
  };
}
