import React, { useEffect, useState } from 'react';

export default function CandidatePortrait({ candidate }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [candidate.image]);
  if (candidate.image && !failed) return <img className="candidate-photo" src={candidate.image} alt={`${candidate.name}, ${candidate.position}`} draggable={false} onError={() => setFailed(true)}/>;
  return <div className="portrait-placeholder" aria-label={`Portrait placeholder for ${candidate.name}`}><div className="portrait-orbit"/><svg viewBox="0 0 240 300" aria-hidden="true"><defs><linearGradient id={`figure-${candidate.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#55a9ff"/><stop offset="1" stopColor="#0d2053"/></linearGradient></defs><path d="M34 280v-28c0-51 37-76 86-76s86 25 86 76v28" fill={`url(#figure-${candidate.id})`} stroke="#5ba7ff"/><ellipse cx="120" cy="117" rx="45" ry="57" fill={`url(#figure-${candidate.id})`} stroke="#71bdff"/><path d="M40 266h160M48 252h144M61 238h118M73 224h94M85 210h70" stroke="#a1d1ff" opacity=".22"/><path d="m98 180 22 39 22-39M120 219v59" stroke="#ffce56" fill="none"/><path d="M67 96h18M155 96h18M67 148h18M155 148h18" stroke="#ffce56"/></svg><span className="portrait-initials">{candidate.initials}</span><span className="portrait-note">PORTRAIT SPACE / READY</span></div>;
}

