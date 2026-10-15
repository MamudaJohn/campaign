import React from 'react';
import { candidateDestination } from '../lib/arena.mjs';

const Arrow = () => <span className="hub-action-arrow" aria-hidden="true">&#8599;</span>;

export default function CampaignHub({ count, profiles = [], onBrowse, onGuide }) {
  return <div className="campaign-hub">
    <div className="hub-map" aria-hidden="true">
      <i/><i/><i/>
      <svg viewBox="0 0 100 100"><path d="M50 12 83 31v38L50 88 17 69V31Z"/><path d="M50 29 68 39v22L50 71 32 61V39Z"/><path d="M50 12v17M17 31l15 8M68 61l15 8M50 71v17M32 61l36-22"/></svg>
      <span className="hub-orbit-node"/>
    </div>
    <div className="hub-status"><span><i/> CAMPAIGN HUB</span><span>{String(count).padStart(2, '0')} PROFILES</span></div>
    <h3>Choose your next move.</h3>
    <p className="hub-intro">Meet the people. Read their ideas. Find a campaign you want to explore.</p>
    <div className="hub-actions">
      <button className="hub-action hub-action-primary" onClick={onBrowse}>
        <span className="hub-action-number" aria-hidden="true">01</span><span><strong>Meet the candidates</strong><small>Open the complete line-up and read their profiles.</small></span><Arrow/>
      </button>
      <a className="hub-action" href="#vision">
        <span className="hub-action-number" aria-hidden="true">02</span><span><strong>Explore the vision</strong><small>Discover the ideas behind this campaign.</small></span><Arrow/>
      </a>
      <button className="hub-action" onClick={onGuide}>
        <span className="hub-action-number" aria-hidden="true">03</span><span><strong>Find your way</strong><small>Reopen the guide to exploring the arena.</small></span><Arrow/>
      </button>
    </div>
    <nav className="hub-profile-links" aria-label="Candidate profiles">{profiles.map(candidate => <a key={candidate.id} href={candidateDestination(candidate)}>Read {candidate.name}'s profile <span aria-hidden="true">&#8599;</span></a>)}</nav>
    <p className="hub-footnote">Every candidate has a story. Start with their profile.</p>
  </div>;
}
