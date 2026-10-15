import React from 'react';

// Decorative suspension hardware stays separate from the interactive card links.
export default function CarouselDock() {
  return <div className="carousel-dock" aria-hidden="true">
    <svg viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid meet">
      <ellipse className="dock-outer" cx="500" cy="236" rx="444" ry="136"/>
      <ellipse className="dock-inner" cx="500" cy="236" rx="404" ry="114"/>
      <path className="dock-path" d="M83 197v-53h90M917 197v-53h-90M83 283v53h90M917 283v53h-90"/>
      <path className="dock-trace" d="M140 236h38m-19-19v38m682-38v38m-19-19h38M460 365h80M473 376h54"/>
      <circle className="dock-traveller blue" r="4"><animateMotion dur="22s" repeatCount="indefinite" path="M56 236a444 136 0 1 0 888 0a444 136 0 1 0-888 0"/></circle>
      <circle className="dock-traveller gold" r="3"><animateMotion dur="18s" repeatCount="indefinite" path="M904 236a404 114 0 1 0-808 0a404 114 0 1 0 808 0"/></circle>
      <circle cx="83" cy="144" r="3"/><circle cx="917" cy="144" r="3"/><circle cx="83" cy="336" r="3"/><circle cx="917" cy="336" r="3"/>
    </svg>
    <span className="dock-label dock-label-left">CANDIDATE / ORBIT</span>
    <span className="dock-label dock-label-right">A NEW PERSPECTIVE</span>
    <div className="dock-platform"><i/><i/><i/></div>
  </div>;
}
