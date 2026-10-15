import React from 'react';

// Quiet academic details connect the lower sections to the digital campus.
export default function AcademicMotifs() {
  return <div className="academic-motifs" aria-hidden="true">
    <svg className="academic-motif motif-book" viewBox="0 0 240 180"><path d="M120 48C84 23 51 25 15 41v115c36-16 69-18 105 7 36-25 69-23 105-7V41c-36-16-69-18-105 7Z"/><path d="M120 48v115M35 66c22-8 44-8 65 5M35 90c22-8 44-8 65 5M140 71c21-13 43-13 65-5M140 95c21-13 43-13 65-5"/></svg>
    <svg className="academic-motif motif-chip" viewBox="0 0 180 180"><rect x="45" y="45" width="90" height="90" rx="8"/><rect x="65" y="65" width="50" height="50" rx="3"/><path d="M65 25v20M90 25v20M115 25v20M65 135v20M90 135v20M115 135v20M25 65h20M25 90h20M25 115h20M135 65h20M135 90h20M135 115h20"/></svg>
    <svg className="academic-motif motif-cap" viewBox="0 0 240 180"><path d="m18 62 102-42 102 42-102 42Zm44 20v46c35 28 81 28 116 0V82M220 65v70M211 135h18l-3 24h-12Z"/></svg>
    <span className="academic-formula">&lt;learn&gt; · &lt;build&gt; · &lt;share&gt;</span>
  </div>;
}
