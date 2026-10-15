import React, { useEffect, useRef, useState } from 'react';
import CandidateCard from './CandidateCard.jsx';
import CandidatePortrait from './CandidatePortrait.jsx';
import CarouselDock from './CarouselDock.jsx';
import { relativePosition, wrapIndex } from '../lib/arena.mjs';

// Standalone revolving candidate stage. Keep this component and its card template
// independent of candidate content so new photos, details and URLs can be added later.
export default function CandidateCarousel({ candidates, motion, blocked, onList, inView }) {
  const [active, setActive] = useState(0);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const advancing = motion && !focused && !hovered && !blocked && inView && candidates.length > 1;
  useEffect(() => {
    if (!advancing) return;
    const timer = setTimeout(() => setActive(current => wrapIndex(current + 1, candidates.length)), 8000);
    return () => clearTimeout(timer);
  }, [active, advancing, candidates.length]);
  useEffect(() => { setActive(current => wrapIndex(current, candidates.length)); }, [candidates.length]);
  function navigate(amount) { setActive(current => wrapIndex(current + amount, candidates.length)); }
  function select(index) { setActive(index); }
  function pointerUp(event) {
    if (!gesture.current) return;
    const dx = event.clientX - gesture.current.x, dy = event.clientY - gesture.current.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { suppressClick.current = true; navigate(dx > 0 ? -1 : 1); }
    gesture.current = null;
  }
  if (!candidates.length) return <div className="empty-stage">The line-up is being prepared. Candidate cards will appear here.</div>;
  const current = candidates[wrapIndex(active, candidates.length)];
  return <div className="carousel-zone" role="region" aria-roledescription="carousel" aria-label="Candidate line-up" onFocusCapture={() => setFocused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
    <div className="deck-telemetry"><span><i/> CANDIDATE TRANSMISSION</span><span>{String(active + 1).padStart(2, '0')} / {String(candidates.length).padStart(2, '0')}</span></div>
    <div className="candidate-deck" tabIndex={0} aria-label="Use left and right arrow keys to rotate the candidates" onPointerEnter={() => setHovered(true)} onPointerLeave={() => { setHovered(false); gesture.current = null; }} onKeyDown={event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); navigate(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); select(event.key === 'Home' ? 0 : candidates.length - 1); }
    }} onPointerDown={event => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      suppressClick.current = false;
      gesture.current = { x: event.clientX, y: event.clientY };
    }} onPointerUp={pointerUp} onPointerCancel={() => { gesture.current = null; }} onDragStart={event => event.preventDefault()} onClickCapture={event => {
      if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false; }
    }}>
      <CarouselDock/>
      <div className="suspension-beam" aria-hidden="true"/>
      {candidates.map((candidate, index) => <CandidateCard key={candidate.id} candidate={candidate} index={index} offset={relativePosition(index, active, candidates.length)} onSelect={select}/>)}
    </div>
    <div className="carousel-controls"><button className="arrow-button" onClick={() => navigate(-1)} aria-label="Previous candidate">←</button><div className="candidate-dots" aria-label="Choose a candidate">{candidates.map((candidate, index) => <button key={candidate.id} aria-label={`Show ${candidate.name}`} title={candidate.name} aria-current={active === index ? 'true' : undefined} onClick={() => select(index)}><span className="candidate-thumbnail" aria-hidden="true"><CandidatePortrait candidate={candidate}/><span>{String(index + 1).padStart(2, '0')}</span></span><span className="thumbnail-name" aria-hidden="true">{candidate.name}</span></button>)}</div><button className="arrow-button" onClick={() => navigate(1)} aria-label="Next candidate">→</button></div>
    <p className="deck-instruction">SWIPE / DRAG TO ROTATE <span>·</span> TAP THE FRONT CARD TO EXPLORE</p>
    <button className="list-toggle" onClick={onList}>View as list <span aria-hidden="true">↗</span></button>
    <p className="sr-only" aria-live={advancing ? 'off' : 'polite'}>{current.name}, {current.position}. Candidate {active + 1} of {candidates.length}.</p>
  </div>;
}
