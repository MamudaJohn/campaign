import React, { useId } from 'react';
import { createSkylineLayout } from '../world/campus-layout.mjs';

// Keep the same campus/city composition before WebGL loads or if it is unavailable.
export default function CampusFallback() {
  const windows = `skyline-windows-${useId().replaceAll(':', '')}`;
  const skyline = createSkylineLayout().sort((a, b) => (a.layer === 'far' ? 0 : 1) - (b.layer === 'far' ? 0 : 1));
  return <div className="campus-fallback" aria-hidden="true">
    <div className="campus-fallback-grid"/>
    <div className="campus-horizon-glow"/>
    <svg className="campus-skyline" viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice">
      <defs><pattern id={windows} width="12" height="17" patternUnits="userSpaceOnUse"><rect x="3" y="4" width="4" height="6" fill="#90b1d2"/></pattern></defs>
      <g className="skyline-towers">{skyline.map(building => {
        const scale = building.layer === 'far' ? 11 : 15;
        const width = building.width * scale;
        const height = building.height * scale;
        const x = 720 + building.x * scale - width / 2;
        const y = (building.layer === 'far' ? 465 : 495) - height;
        return <g key={building.id} className={`skyline-building skyline-${building.layer}`}>
          <rect className="skyline-facade" x={x} y={y} width={width} height={height}/>
          <rect className="skyline-windows" x={x + 3} y={y + 4} width={width - 6} height={height - 8} fill={`url(#${windows})`}/>
          <rect className="skyline-roof" x={x + width * .14} y={y - 7} width={width * .65} height="7"/>
          <path d={`M${x + width * .22} ${y}h${width * .55}`} stroke={building.accent === 'gold' ? '#b7a16d' : '#739dca'} strokeOpacity=".55"/>
        </g>;
      })}</g>
    </svg>
    <svg className="campus-connections" viewBox="0 0 1440 700" preserveAspectRatio="none">
      <path d="M0 325C170 95 240 150 420 440M1440 290C1260 100 1190 165 1030 445"/>
      <circle r="3"><animateMotion dur="14s" repeatCount="indefinite" path="M0 325C170 95 240 150 420 440"/></circle>
      <circle r="3"><animateMotion dur="17s" repeatCount="indefinite" path="M1440 290C1260 100 1190 165 1030 445"/></circle>
    </svg>
    <div className="campus-fallback-wings"><i/><i/><i/></div>
    <svg className="academic-book book-left" viewBox="0 0 240 180"><path d="M120 48C84 23 51 25 15 41v115c36-16 69-18 105 7 36-25 69-23 105-7V41c-36-16-69-18-105 7Z"/><path d="M120 48v115M34 62c24-9 46-9 67 5M34 82c24-9 46-9 67 5M34 102c24-9 46-9 67 5M139 67c21-14 43-14 67-5M139 87c21-14 43-14 67-5M139 107c21-14 43-14 67-5"/></svg>
    <svg className="academic-research" viewBox="0 0 240 200"><ellipse cx="120" cy="100" rx="105" ry="37"/><ellipse cx="120" cy="100" rx="105" ry="37" transform="rotate(60 120 100)"/><ellipse cx="120" cy="100" rx="105" ry="37" transform="rotate(-60 120 100)"/><circle cx="120" cy="100" r="8"/></svg>
    <div className="campus-code"><span>LEARN / BUILD / DISCOVER</span><i>&lt;learning&gt;</i><i>curiosity.connect();</i><i>knowledge.share();</i><i>&lt;/learning&gt;</i></div>
    <div className="campus-fallback-floor"/>
  </div>;
}
