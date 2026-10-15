import React from 'react';
import CandidatePortrait from './CandidatePortrait.jsx';
import { candidateDestination } from '../lib/arena.mjs';

// Reusable suspended slide template. Content comes from src/data/campaign.js.
// candidate: { id, name, position, statement, image, link, initials, configured }
// A populated `link` opens the supplied URL; a blank link opens the local profile.
export default function CandidateCard({ candidate, index, offset, onSelect }) {
  const distance = Math.abs(offset);
  return <div className={`candidate-orbiter ${offset === 0 ? 'is-front' : ''}`} data-away={distance > 1} style={{ '--offset': offset, '--distance': distance, '--float-delay': `${index * -1.7}s`, zIndex: 10 - distance }} aria-hidden={offset !== 0}>
    <a className="candidate-card" href={candidateDestination(candidate)} tabIndex={offset === 0 ? 0 : -1} aria-label={`Open ${candidate.name}, ${candidate.position}`} draggable={false} onClick={event => {
      if (offset !== 0) { event.preventDefault(); onSelect(index); }
    }}>
      <div className="candidate-portrait"><CandidatePortrait candidate={candidate}/><span className="portrait-caption">{candidate.configured ? 'CANDIDATE PROFILE' : 'OPEN CANDIDATE SLOT'}</span></div>
      <div className="candidate-copy">
        <div className="candidate-status"><span>{candidate.configured ? 'MEET YOUR CANDIDATE' : 'AWAITING DETAILS'}</span><span>[ {String(index + 1).padStart(2, '0')} ]</span></div>
        <p className="candidate-position">{candidate.position}</p>
        <h2>{candidate.name}</h2>
        <p className="candidate-statement">{candidate.statement}</p>
        <span className="candidate-cta">{candidate.link ? 'Explore campaign' : 'Open candidate profile'} <span aria-hidden="true">↗</span></span>
        <span className="candidate-edge" aria-hidden="true"/>
      </div>
    </a>
  </div>;
}
