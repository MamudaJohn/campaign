import React from 'react';

// A lightweight skyline remains visible while WebGL loads or is unavailable.
export default function CityFallback() {
  return <div className="city-fallback" aria-hidden="true"><div className="fallback-sky"/><div className="fallback-buildings">{[42, 68, 50, 81, 35, 63, 32, 47, 28, 42, 65, 37, 79, 58, 85, 48, 72, 45].map((height, index) => <i key={index} style={{ '--tower-height': `${height}%`, '--tower-hue': index % 3 === 0 ? '#ffd37b' : '#659cff' }}/>)}</div><div className="fallback-plaza"/><div className="css-universe"><i/><i/><i/></div></div>;
}
