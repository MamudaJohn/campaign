import React from 'react';
import CandidatePortrait from './CandidatePortrait.jsx';
import { candidateDestination } from '../lib/arena.mjs';

// Reusable suspended slide template. Content comes from src/data/campaign.js.
// candidate: { id, name, position, statement, image, link, initials, configured }
// Every card opens the local profile; its campaign button opens the supplied URL.
export default function CandidateCard({ candidate, index, offset, onSelect }) {
  const distance = Math.abs(offset);
  const isFront = offset === 0;
  return <div className={`candidate-orbiter ${offset === 0 ? 'is-front' : ''}`} data-away={distance > 1} style={{ '--offset': offset, '--distance': distance, '--float-delay': `${index * -1.7}s`, zIndex: 10 - distance }} aria-hidden={offset !== 0}>
    <a className="candidate-card" href={candidateDestination(candidate)} tabIndex={isFront ? 0 : -1} aria-label={isFront ? `Meet ${candidate.name}, read the full candidate profile` : `Bring ${candidate.name} forward`} aria-describedby={isFront ? 'candidate-photo-help' : undefined} data-action={isFront ? 'open-profile' : 'bring-forward'} draggable={false} onClick={event => {
      if (offset !== 0) { event.preventDefault(); onSelect(index); }
    }}>
      <div className="candidate-portrait">
        <CandidatePortrait candidate={candidate} priority={isFront}/>
        <span className="portrait-index" aria-hidden="true">{String(index + 1).padStart(2, '0')} / PROFILE</span>
        <span className="portrait-action" aria-hidden="true">
          <span className="portrait-action-label"><strong>{isFront ? (candidate.configured ? `Meet ${candidate.name}` : 'Explore this candidate') : 'Bring forward'}</strong><small>{isFront ? 'Tap photo to read their story' : candidate.name}</small></span>
          <span className="portrait-action-icon"><svg viewBox="0 0 24 24">{isFront ? <path d="M6 18 18 6M6 6h12v12"/> : <path d={offset < 0 ? 'm9 5 7 7-7 7' : 'm15 5-7 7 7 7'}/>}</svg></span>
        </span>
      </div>
      <div className="candidate-copy">
        <div className="candidate-status"><span>{candidate.configured ? 'MEET YOUR CANDIDATE' : 'AWAITING DETAILS'}</span><span>[ {String(index + 1).padStart(2, '0')} ]</span></div>
        <p className="candidate-position">{candidate.position}</p>
        <h2>{candidate.name}</h2>
        <p className="candidate-statement">{candidate.statement}</p>
        <span className="candidate-cta">{isFront ? 'Read full profile' : 'Bring this candidate forward'} <span aria-hidden="true">↗</span></span>
        <span className="candidate-edge" aria-hidden="true"/>
      </div>
      <span className="candidate-chassis" aria-hidden="true"><i/><i/><i/><i/></span>
      <span className="candidate-spine" aria-hidden="true"/>
    </a>
  </div>;
}
