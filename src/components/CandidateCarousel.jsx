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
    <p className="stage-invitation" id="candidate-photo-help">
      <span className="stage-invitation-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 12V5a2 2 0 0 1 4 0v6l1-1a2 2 0 0 1 3 1l2 2v4a5 5 0 0 1-5 5h-2c-2 0-3-1-4-3l-3-5a2 2 0 0 1 3-2l1 1M4 5l-2-1M18 4l2-1"/></svg></span>
      <span><strong>Get to know your candidates.</strong><span>Tap a photo to read their story.</span></span>
    </p>
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
      {candidates.map((candidate, index) => Math.abs(relativePosition(index, active, candidates.length)) <= 1 ? <CandidateCard key={candidate.id} candidate={candidate} index={index} offset={relativePosition(index, active, candidates.length)} onSelect={select}/> : null)}
    </div>
    <div className="carousel-controls"><button className="arrow-button" onClick={() => navigate(-1)} aria-label="Previous candidate">←</button><div className="candidate-dots" aria-label="Choose a candidate">{candidates.map((candidate, index) => <button key={candidate.id} aria-label={`Show ${candidate.name}`} title={candidate.name} aria-current={active === index ? 'true' : undefined} onClick={() => select(index)}><span className="candidate-thumbnail" aria-hidden="true"><CandidatePortrait candidate={candidate}/><span>{String(index + 1).padStart(2, '0')}</span></span><span className="thumbnail-name" aria-hidden="true">{candidate.name}</span></button>)}</div><button className="arrow-button" onClick={() => navigate(1)} aria-label="Next candidate">→</button></div>
    <p className="deck-instruction">{candidates.length > 1 ? 'Swipe or use the arrows to see more candidates.' : 'Tap the photo to read the candidate profile.'}</p>
    <button className="list-toggle" onClick={onList}>View as list <span aria-hidden="true">↗</span></button>
    <p className="sr-only" aria-live={advancing ? 'off' : 'polite'}>{current.name}, {current.position}. Candidate {active + 1} of {candidates.length}.</p>
  </div>;
}
