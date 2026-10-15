import React, { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { campaign } from './data/campaign';
import { candidateDestination, candidateCampaignLink } from './lib/arena.mjs';
import './arena.css';
import CandidateCarousel from './components/CandidateCarousel.jsx';
import CampaignHub from './components/CampaignHub.jsx';
import Portrait from './components/CandidatePortrait.jsx';
import CampusFallback from './components/CampusFallback.jsx';
import AcademicMotifs from './components/AcademicMotifs.jsx';

const ArenaScene = lazy(() => import('./ArenaScene.jsx'));
const Arrow = () => <span aria-hidden="true">↗</span>;

function firstVisit() { try { return sessionStorage.getItem('arena-guide-seen') !== 'yes'; } catch { return true; } }

function Emblem({ image, className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image]);
  return <span className={`emblem ${className}`} aria-hidden="true">{image && !failed ? <img src={image} alt="" onError={() => setFailed(true)}/> : <svg viewBox="0 0 100 100"><path d="M50 5 89 28v44L50 95 11 72V28Z"/><path d="m50 21 25 15v28L50 79 25 64V36Z"/><path d="M35 63V38h30M35 63l30-25M50 5v16M50 79v16M11 28l14 8M75 64l14 8"/></svg>}</span>;
}


class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <CampusFallback/> : this.props.children; }
}

function Modal({ title, className = '', children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    element.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element.close(); document.body.style.overflow = previous; };
  }, []);
  return <dialog ref={ref} className={`space-modal ${className}`} aria-label={title} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}><div className="modal-shell"><button className="modal-close" onClick={onClose} aria-label={`Close ${title}`}>×</button>{children}</div></dialog>;
}

const guideSteps = [
  { index: '01', title: 'Welcome to a new dimension.', text: 'The candidate stage floats above a connected university, with learning labs, floating ideas, and a future city on the horizon. Follow the light, rotate the line-up, and find the voices shaping what comes next.', hint: 'YOUR FIRST MISSION: EXPLORE THE STAGE', symbol: '✧' },
  { index: '02', title: 'Take the line-up for a spin.', text: 'Swipe or drag the cards left and right. You can also use the on-screen arrows, portrait thumbnails, or your keyboard’s left and right arrow keys while the stage is focused.', hint: 'SWIPE  ↔  /  ARROW KEYS  ← →', symbol: '↔' },
  { index: '03', title: 'Step into a candidate’s world.', text: 'Tap a side card to bring it forward. Tap the large front card to open that candidate’s detail page. The campaign button on that page opens their external link. Use “View as list” to see every candidate together.', hint: 'BRING FORWARD → TAP TO OPEN', symbol: '↗' },
];

function NavigationGuide({ onClose }) {
  const [step, setStep] = useState(0);
  const current = guideSteps[step];
  return <Modal title="Navigation guide" className="guide-modal" onClose={onClose}>
    <p className="eyebrow">ORIENTATION PROTOCOL / {current.index} OF {String(guideSteps.length).padStart(2, '0')}</p>
    <div className="guide-illustration" aria-hidden="true">
      <i/><i/>
      <span key={step}>{current.symbol}</span>
      <b>EXPLORE THE ARENA</b>
    </div>
    <h2>{current.title}</h2>
    <p className="guide-copy">{current.text}</p>
    <div className="guide-hint">{current.hint}</div>
    <div className="guide-progress" aria-label={`Step ${step + 1} of ${guideSteps.length}`}>
      {guideSteps.map((item, index) => (
        <button key={item.index} aria-label={`Guide step ${index + 1}`} aria-current={index === step ? 'step' : undefined} 
        onClick={() => setStep(index)}/>))
      }
    </div>
    <div className="guide-actions"><button className="quiet-button" onClick={onClose}>Skip guide</button><button className="gold-button" onClick={() => step === guideSteps.length - 1 ? onClose() : setStep(step + 1)}>{step === guideSteps.length - 1 ? 'Enter the arena' : 'Next instruction'} <Arrow/></button></div>
  </Modal>;
}

function CandidateDirectory({ candidates, onClose }) {
  return <Modal title="Candidate directory" className="directory-modal" onClose={onClose}>
    <p className="eyebrow">THE COMPLETE LINE-UP</p>
    <h2>Choose your next<br/><em>perspective.</em></h2>
    <div className="candidate-directory">
      {candidates.map(candidate => (
        <a key={candidate.id} href={candidateDestination(candidate)}>
          <div>
            <Portrait candidate={candidate}/>
          </div>
          <span>
            <p>{candidate.position}</p>
            <strong>{candidate.name}</strong>
            <p>{candidate.configured ? candidate.statement : 'Empty slot · ready for candidate details'}</p>
          </span>
          <Arrow/>
          </a>))}
      </div>
    </Modal>;
}

export function CandidateProfile({ candidate, config }) {
  const campaignLink = candidateCampaignLink(candidate);
  return <div className="experience profile-experience" data-motion="on" data-quality="cinematic">
    <div className="space-grain"/>
    <header className="space-header">
      <a className="space-brand" href="./">
        <Emblem image={config.themeImage}/>
        <span>UPGRADE<small>RUNACOS / A NEW DIMENSION</small></span>
      </a>
      <a className="outline-button" href="./">← Back to the arena</a>
    </header>
    <main className="profile-main">
      <div className="profile-portrait">
        <Portrait candidate={candidate}/>
        <span className="portrait-caption">
          {candidate.configured ? 'CANDIDATE DOSSIER' : 'EMPTY CANDIDATE SLOT'}
        </span>
      </div>
      <div className="profile-copy">
        <p className="eyebrow">CANDIDATE PROFILE / {candidate.initials}</p>
        <p className="candidate-position">{candidate.position}</p>
        <h1>{candidate.name}<span>.</span></h1>
        <p className="profile-statement">{candidate.statement}</p>
        <p className="profile-detail">{candidate.detail}</p>
        {!candidate.image && <p className="profile-note">Candidate portrait coming soon.</p>}
        {campaignLink ? <a className="gold-button" href={campaignLink} target="_blank" rel="noopener noreferrer" aria-label="Explore campaign (opens in a new tab)">Explore campaign <Arrow/></a> : <p className="profile-note">Campaign link coming soon.</p>}
        <a className="back-link" href="./">← Return to the revolving stage</a>
      </div>
    </main>
    <footer className="space-footer">
      <span>UPGRADE RUNACOS</span>
      <span>Candidate details supplied by the campaign · Empty slots are placeholders</span>
    </footer>
  </div>;
}

export default function Experience() {
  const config = campaign;
  const motion = true;
  const quality = 'cinematic';
  const [overlay, setOverlay] = useState(() => firstVisit() ? 'guide' : null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const arena = useRef(null), pointer = useRef({ x: 0, y: 0 });
  const candidateId = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('candidate');
  const profile = config.candidates.find(candidate => candidate.id === candidateId);

  useEffect(() => {
    const visibility = () => setPageVisible(!document.hidden);
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => document.removeEventListener('visibilitychange', visibility);
  }, []);
  useEffect(() => {
    if (!arena.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(arena.current); return () => observer.disconnect();
  }, []);
  function closeGuide() { try { sessionStorage.setItem('arena-guide-seen', 'yes'); } catch {} setOverlay(null); }
  if (profile) return <CandidateProfile candidate={profile} config={config}/>;

  return <div className="experience" data-motion="on" data-quality={quality}>
    <AcademicMotifs/>
    <a className="skip-link" href="#candidate-stage">Skip to candidate stage</a><div className="space-grain" aria-hidden="true"/>
    <div className="theme-cloud" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <div className={`theme-shard shard-${index}`} key={index} style={{ '--spin': `${index * 29}deg`, '--delay': `${index * -2.3}s` }}><Emblem image={config.themeImage}/><span>{config.themeImage ? 'UPGRADE' : 'YOUR EMBLEM'}</span></div>)}</div>
    <header className="space-header">
      <a className="space-brand" href="#">
        <Emblem image={config.themeImage}/>
        <span>UPGRADE<small>RUNACOS / A NEW DIMENSION</small></span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#candidate-stage">The line-up</a>
        <a href="#vision">The vision</a>
        <a href="#explore">Campaign hub <Arrow/></a>
      </nav>
</header>
    <main>
      <section className="arena" ref={arena} aria-labelledby="arena-heading" onPointerMove={event => {
        if (event.pointerType === 'touch') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointer.current = { x: (event.clientX - bounds.left) / bounds.width * 2 - 1, y: (event.clientY - bounds.top) / bounds.height * 2 - 1 };
        event.currentTarget.style.setProperty('--look-x', `${pointer.current.x * 7}px`);
        event.currentTarget.style.setProperty('--look-y', `${pointer.current.y * 4}px`);
      }} onPointerLeave={() => { pointer.current = { x: 0, y: 0 }; arena.current?.style.setProperty('--look-x', '0px'); arena.current?.style.setProperty('--look-y', '0px'); }}>
        <div className="arena-scene" aria-hidden="true">
          <SceneBoundary>
            <Suspense fallback={<CampusFallback/>}>
              <ArenaScene motion={inView && pageVisible} pointer={pointer} quality={quality}/>
            </Suspense>
          </SceneBoundary>
        </div>
        <div className="arena-vignette" aria-hidden="true"/>
        <div className="arena-title">
          <p className="eyebrow">
            <span className="signal-dot"/> THE NEXT CHAPTER HAS ENTERED THE ARENA
          </p>
          <h1 id="arena-heading">Your future.<br/><em>Another dimension.</em></h1>
          <p>A new generation of voices. A shared world of possibility.<br/>Step inside. Find the people ready to shape what’s next.</p>
        </div>
        <span className="arena-side-label side-left" aria-hidden="true">LEARN. BUILD. DISCOVER.</span>
        <span className="arena-side-label side-right" aria-hidden="true">TECHNOLOGY / LEARNING / COMMUNITY</span>
        <div id="candidate-stage" className="candidate-stage">
          <CandidateCarousel candidates={config.candidates} motion={motion} blocked={Boolean(overlay)} inView={inView && pageVisible} onList={() => setOverlay('directory')}/>
        </div>
        <div className="arena-floor-label" aria-hidden="true">
          <span className="signal-dot"/> VIRTUAL AUDIENCE / A CAMPUS IN MOTION
        </div>
        <div className="arena-bottom">
          <span>PEOPLE FIRST. PROGRESS TOGETHER.</span>
          <a href="#vision">CONTINUE THE JOURNEY <span aria-hidden="true">↓</span></a>
          <span>EXPERIENCE / 001</span>
        </div>
      </section>

      <section id="vision" className="vision-world world-section">
        <div className="section-coordinate">01 / THE BIG IDEA</div>
        <div className="vision-heading">
          <h2>Change doesn’t<br/>happen from<br/><em>the sidelines.</em></h2>
          <div className="floating-orb" aria-hidden="true">
            <i/><i/><Emblem image={config.themeImage}/>
          </div>
        </div>
        <div className="glass-panel vision-panel">
          <span className="panel-corner" aria-hidden="true"/>
          <p className="large-copy">It starts with a conversation.<br/>With an idea.<br/>With someone who decides<br/>things can be better.</p>
          <p>A fresh start is built around a simple belief: our community is strongest when everyone has a part to play. People, ideas, and everyday action can shape what comes next.</p>
          <a className="text-link" href="#priorities">Explore the possibilities <Arrow/></a>
          <span className="content-note">Concept campaign · Illustrative vision and priorities</span>
        </div>
      </section>
      <section id="priorities" className="priorities-world world-section"><div className="section-coordinate">02 / THE POSSIBILITIES</div><div className="section-intro"><h2>Big ideas.<br/><em>Real-world impact.</em></h2><p>Fresh thinking should mean something.<br/>Here are three places to begin.</p></div><div className="orbit-priorities">{[
        ['01', 'Opportunity, closer to home.', 'Practical skills, new connections, and a fair chance to build something that matters.', '↗'],
        ['02', 'Everyday life, made better.', 'Welcoming shared spaces, reliable support, and a community shaped around its people.', '⌘'],
        ['03', 'A future we can grow into.', 'Thoughtful choices today. Stronger foundations for everyone who comes next.', '✳'],
      ].map(([number, title, text, icon], index) => <article className="glass-panel possibility" key={number} style={{ '--delay': `${index * -2}s` }}><div className="possibility-top"><span>IDEA / {number}</span><span aria-hidden="true">{icon}</span></div><h3>{title}</h3><p>{text}</p><a className="text-link" href="#explore">Explore the campaign <Arrow/></a></article>)}</div></section>
      <section id="explore" className="hub-world world-section" aria-labelledby="campaign-hub-heading">
        <div className="section-coordinate">03 / THE CAMPAIGN HUB</div>
        <div className="hub-heading">
          <p className="eyebrow">THE NEXT MOVE IS YOURS</p>
          <h2 id="campaign-hub-heading">Your next<br/>move starts<br/><em>here.</em><span aria-hidden="true">↗</span></h2>
          <p>Get to know the candidates.<br/>Explore the people and ideas shaping what comes next.</p>
          <div className="hub-halo" aria-hidden="true"><i/><i/><i/></div>
        </div>
        <CampaignHub count={config.candidates.length} onBrowse={() => setOverlay('directory')} onGuide={() => setOverlay('guide')}/>
      </section>
    </main>
    <footer className="space-footer"><a className="space-brand" href="#"><Emblem image={config.themeImage}/><span>UPGRADE<small>RUNACOS</small></span></a><p>A future worth building. Together.</p><span>© {new Date().getFullYear()} · Candidate showcase concept</span><a href="#">BACK TO ORBIT ↑</a></footer>
    <button className="guide-trigger" onClick={() => setOverlay('guide')} aria-label="Open navigation guide"><span>?</span><span>NAVIGATION GUIDE</span></button>
    {overlay === 'guide' && <NavigationGuide onClose={closeGuide}/>}
    {overlay === 'directory' && <CandidateDirectory candidates={config.candidates} onClose={() => setOverlay(null)}/>}
  </div>;
}
