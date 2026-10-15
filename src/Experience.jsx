import React, { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { campaign } from './data/campaign';
import { candidateDestination, restoreConfig } from './lib/arena.mjs';
import './arena.css';
import CandidateCarousel from './components/CandidateCarousel.jsx';
import Portrait from './components/CandidatePortrait.jsx';
import CityFallback from './components/CityFallback.jsx';

const ArenaScene = lazy(() => import('./ArenaScene.jsx'));
const STORAGE_KEY = 'runacos-space-studio-v1';
const Arrow = () => <span aria-hidden="true">↗</span>;

function loadConfig() {
  try { return restoreConfig(JSON.parse(localStorage.getItem(STORAGE_KEY)), campaign); } catch { return campaign; }
}
function prefersMotion() { return typeof matchMedia === 'undefined' || !matchMedia('(prefers-reduced-motion: reduce)').matches; }
function initialQuality() {
  try { const saved = localStorage.getItem('runacos-visual-quality'); if (saved === 'cinematic' || saved === 'balanced') return saved; } catch {}
  return typeof window !== 'undefined' && (window.innerWidth < 800 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 5)) ? 'balanced' : 'cinematic';
}
function firstVisit() { try { return sessionStorage.getItem('arena-guide-seen') !== 'yes'; } catch { return true; } }

function Emblem({ image, className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [image]);
  return <span className={`emblem ${className}`} aria-hidden="true">{image && !failed ? <img src={image} alt="" onError={() => setFailed(true)}/> : <svg viewBox="0 0 100 100"><path d="M50 5 89 28v44L50 95 11 72V28Z"/><path d="m50 21 25 15v28L50 79 25 64V36Z"/><path d="M35 63V38h30M35 63l30-25M50 5v16M50 79v16M11 28l14 8M75 64l14 8"/></svg>}</span>;
}


class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <CityFallback/> : this.props.children; }
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
  { index: '01', title: 'Welcome to a new dimension.', text: 'The candidate stage floats in the heart of a futuristic city. Follow the light, rotate the line-up, and find the voices shaping what comes next.', hint: 'YOUR FIRST MISSION: EXPLORE THE STAGE', symbol: '✧' },
  { index: '02', title: 'Take the line-up for a spin.', text: 'Swipe or drag the cards left and right. You can also use the on-screen arrows, candidate dots, or your keyboard’s left and right arrow keys while the stage is focused.', hint: 'SWIPE  ↔  /  ARROW KEYS  ← →', symbol: '↔' },
  { index: '03', title: 'Step into a candidate’s world.', text: 'Tap a side card to bring it forward. Tap the large front card to open that candidate’s profile or connected campaign link. Use “View as list” to see every candidate together.', hint: 'BRING FORWARD → TAP TO OPEN', symbol: '↗' },
  { index: '04', title: 'Make this universe yours.', text: 'Scene studio lets you add candidate portraits, details, destination links, and one theme image that floats across the world. Cinematic enables reflections and richer lighting; Balanced uses lighter visuals. Motion pauses the scene. Reopen this guide with the ? button.', hint: 'STUDIO / MOTION / GUIDE — ALWAYS WITHIN REACH', symbol: '✳' },
];

function NavigationGuide({ onClose }) {
  const [step, setStep] = useState(0);
  const current = guideSteps[step];
  return <Modal title="Navigation guide" className="guide-modal" onClose={onClose}>
    <p className="eyebrow">ORIENTATION PROTOCOL / {current.index} OF 04</p>
    <div className="guide-illustration" aria-hidden="true"><i/><i/><span key={step}>{current.symbol}</span><b>EXPLORE THE ARENA</b></div>
    <h2>{current.title}</h2><p className="guide-copy">{current.text}</p><div className="guide-hint">{current.hint}</div>
    <div className="guide-progress" aria-label={`Step ${step + 1} of 4`}>{guideSteps.map((item, index) => <button key={item.index} aria-label={`Guide step ${index + 1}`} aria-current={index === step ? 'step' : undefined} onClick={() => setStep(index)}/>)}</div>
    <div className="guide-actions"><button className="quiet-button" onClick={onClose}>Skip guide</button><button className="gold-button" onClick={() => step === 3 ? onClose() : setStep(step + 1)}>{step === 3 ? 'Enter the arena' : 'Next instruction'} <Arrow/></button></div>
  </Modal>;
}

function SceneStudio({ config, onSave, onClose }) {
  const [draft, setDraft] = useState(() => ({ ...config, candidates: config.candidates.map(candidate => ({ ...candidate })) }));
  const [editing, setEditing] = useState(0);
  const [error, setError] = useState('');
  const candidate = draft.candidates[editing];
  function updateCandidate(field, value) {
    setDraft(current => ({ ...current, candidates: current.candidates.map((item, index) => index === editing ? { ...item, [field]: value } : item) }));
  }
  async function readImage(event, target) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 1.5 * 1024 * 1024) { setError('Choose a JPG, PNG, WebP, or GIF smaller than 1.5 MB.'); return; }
    try {
      const image = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
      if (target === 'theme') setDraft(current => ({ ...current, themeImage: image }));
      else updateCandidate('image', image);
      setError('');
    } catch { setError('The image could not be read. Please choose another file.'); }
    event.target.value = '';
  }
  function save(event) {
    event.preventDefault();
    const invalid = draft.candidates.some(item => item.link.trim() && candidateDestination(item).startsWith('?'));
    if (invalid) { setError('Candidate destination links must start with https:// or http://.'); return; }
    onSave(restoreConfig(draft, campaign));
  }
  return <Modal title="Scene studio" className="studio-modal" onClose={onClose}><p className="eyebrow">PERSONALISE THE UNIVERSE</p><h2>Scene studio<span>.</span></h2><p className="studio-note">Preview your artwork and candidate details. Changes stay in this browser.</p>
    <form onSubmit={save}>
      <div className="theme-editor"><Emblem image={draft.themeImage}/><div><h3>Your recurring theme image</h3><p>One image, scattered across the whole world.</p><label className="upload-button">Choose theme image<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => readImage(event, 'theme')}/></label>{draft.themeImage && <button type="button" className="quiet-button" onClick={() => setDraft(current => ({ ...current, themeImage: '' }))}>Remove image</button>}</div></div>
      <label className="field">Candidate slot<select value={editing} onChange={event => setEditing(Number(event.target.value))}>{draft.candidates.map((item, index) => <option value={index} key={item.id}>{String(index + 1).padStart(2, '0')} / {item.name}</option>)}</select></label>
      <div className="studio-fields"><label className="field">Name<input required maxLength={80} value={candidate.name} onChange={event => updateCandidate('name', event.target.value)}/></label><label className="field">Position<input required maxLength={80} value={candidate.position} onChange={event => updateCandidate('position', event.target.value)}/></label></div>
      <label className="field">Short card statement<textarea required maxLength={240} rows={3} value={candidate.statement} onChange={event => updateCandidate('statement', event.target.value)}/></label>
      <label className="field">Full profile details<textarea maxLength={1800} rows={4} value={candidate.detail} onChange={event => updateCandidate('detail', event.target.value)}/></label>
      <label className="field">Destination link<input type="url" placeholder="https://your-candidate-page.com" value={candidate.link} onChange={event => updateCandidate('link', event.target.value)}/><small>Leave blank to open the built-in candidate profile.</small></label>
      <div className="portrait-editor"><div><Portrait candidate={candidate}/></div><div><label className="upload-button">Choose candidate portrait<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => readImage(event, 'candidate')}/></label>{candidate.image && <button type="button" className="quiet-button" onClick={() => updateCandidate('image', '')}>Remove portrait</button>}<label className="check"><input type="checkbox" checked={candidate.configured} onChange={event => updateCandidate('configured', event.target.checked)}/> Candidate details are ready</label></div></div>
      <p className="studio-error" role="alert">{error}</p><button className="gold-button" type="submit">Apply to this universe <Arrow/></button>
    </form>
  </Modal>;
}


function CandidateDirectory({ candidates, onClose }) {
  return <Modal title="Candidate directory" className="directory-modal" onClose={onClose}><p className="eyebrow">THE COMPLETE LINE-UP</p><h2>Choose your next<br/><em>perspective.</em></h2><div className="candidate-directory">{candidates.map(candidate => <a key={candidate.id} href={candidateDestination(candidate)}><div><Portrait candidate={candidate}/></div><span><small>{candidate.position}</small><strong>{candidate.name}</strong><p>{candidate.configured ? candidate.statement : 'Empty slot · ready for candidate details'}</p></span><Arrow/></a>)}</div></Modal>;
}

function CandidateProfile({ candidate, config }) {
  return <div className="experience profile-experience" data-motion="off"><div className="space-grain"/><header className="space-header"><a className="space-brand" href="./"><Emblem image={config.themeImage}/><span>UPGRADE<small>RUNACOS / A NEW DIMENSION</small></span></a><a className="outline-button" href="./">← Back to the arena</a></header><main className="profile-main"><div className="profile-portrait"><Portrait candidate={candidate}/><span className="portrait-caption">{candidate.configured ? 'CANDIDATE DOSSIER' : 'EMPTY CANDIDATE SLOT'}</span></div><div className="profile-copy"><p className="eyebrow">CANDIDATE PROFILE / {candidate.initials}</p><p className="candidate-position">{candidate.position}</p><h1>{candidate.name}<span>.</span></h1><p className="profile-statement">{candidate.statement}</p><p className="profile-detail">{candidate.detail}</p>{!candidate.image && <p className="profile-note">Candidate portrait coming soon.</p>}<a className="gold-button" href="./#join">Be part of what’s next <Arrow/></a><a className="back-link" href="./">← Return to the revolving stage</a></div></main><footer className="space-footer"><span>UPGRADE RUNACOS</span><span>Candidate details supplied by the campaign · Empty slots are placeholders</span></footer></div>;
}

function JoinForm() {
  const [joined, setJoined] = useState(false), [notice, setNotice] = useState('');
  function submit(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try { localStorage.setItem('start-over-interest', JSON.stringify(Object.fromEntries(data))); setJoined(true); setNotice(''); }
    catch { setNotice('Your browser could not save your details. Please try again with local storage enabled.'); }
  }
  return <div className="join-console">{joined ? <div className="joined-state" role="status"><span aria-hidden="true">✳</span><h3>You’re part of the idea.</h3><p>Your interest is saved on this device. This demo has not sent your details to a campaign.</p><button className="outline-button" onClick={() => setJoined(false)}>Update details</button><button className="quiet-button" onClick={() => { try { localStorage.removeItem('start-over-interest'); setJoined(false); setNotice('Saved details removed.'); } catch { setNotice('The saved details could not be removed.'); } }}>Remove saved details</button></div> : <form onSubmit={submit}><p className="eyebrow">OPEN CHANNEL / GET INVOLVED</p><h3>Every movement<br/>starts with a hello.</h3><label className="field">Your name<input required name="name" autoComplete="name" placeholder="First and last name" maxLength={100}/></label><label className="field">Email address<input required type="email" name="email" autoComplete="email" placeholder="you@example.com" maxLength={254}/></label><label className="field">I’d like to<select name="interest"><option>Stay in the loop</option><option>Volunteer my time</option><option>Join a community event</option><option>Share an idea</option></select></label><label className="check"><input required type="checkbox"/> Save my details on this device.</label><button className="gold-button" type="submit">Count me in <Arrow/></button><p className="form-note">Demo form. Details stay in this browser and are never sent to a server.</p></form>}<p className="form-note" role="status">{notice}</p></div>;
}

export default function Experience() {
  const [config, setConfig] = useState(loadConfig);
  const [motion, setMotion] = useState(prefersMotion);
  const [quality, setQuality] = useState(initialQuality);
  const [overlay, setOverlay] = useState(() => firstVisit() ? 'guide' : null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [toast, setToast] = useState('');
  const arena = useRef(null), pointer = useRef({ x: 0, y: 0 });
  const candidateId = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('candidate');
  const profile = config.candidates.find(candidate => candidate.id === candidateId);

  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setMotion(!query.matches);
    const visibility = () => setPageVisible(!document.hidden);
    query.addEventListener('change', update); document.addEventListener('visibilitychange', visibility);
    return () => { query.removeEventListener('change', update); document.removeEventListener('visibilitychange', visibility); };
  }, []);
  useEffect(() => {
    if (!arena.current || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(arena.current); return () => observer.disconnect();
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 6500); return () => clearTimeout(timer); }, [toast]);
  function closeGuide() { try { sessionStorage.setItem('arena-guide-seen', 'yes'); } catch {} setOverlay(null); }
  function toggleQuality() {
    const next = quality === 'cinematic' ? 'balanced' : 'cinematic';
    setQuality(next);
    try { localStorage.setItem('runacos-visual-quality', next); } catch {}
  }
  function saveStudio(value) {
    setConfig(value); setOverlay(null);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); setToast('Your universe is updated. Changes are saved in this browser.'); }
    catch { setToast('Preview updated for this visit. Browser storage is full; use smaller images to keep the changes.'); }
  }

  if (profile) return <CandidateProfile candidate={profile} config={config}/>;

  return <div className="experience" data-motion={motion ? 'on' : 'off'}>
    <a className="skip-link" href="#candidate-stage">Skip to candidate stage</a><div className="space-grain" aria-hidden="true"/>
    <div className="theme-cloud" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <div className={`theme-shard shard-${index}`} key={index} style={{ '--spin': `${index * 29}deg`, '--delay': `${index * -2.3}s` }}><Emblem image={config.themeImage}/><span>{config.themeImage ? 'UPGRADE' : 'YOUR EMBLEM'}</span></div>)}</div>
    <header className="space-header"><a className="space-brand" href="#"><Emblem image={config.themeImage}/><span>UPGRADE<small>RUNACOS / A NEW DIMENSION</small></span></a><nav aria-label="Main navigation"><a href="#candidate-stage">The line-up</a><a href="#vision">The vision</a><a href="#join">Get involved <Arrow/></a></nav><div className="header-tools"><button className="quality-button" onClick={toggleQuality} aria-label={quality === 'cinematic' ? 'Visual quality: cinematic. Switch to balanced for lighter rendering' : 'Visual quality: balanced. Switch to cinematic for reflections and bloom'} title="Choose cinematic lighting and reflections or lighter balanced visuals"><span aria-hidden="true">◇</span> {quality === 'cinematic' ? 'CINEMATIC' : 'BALANCED'}</button><button className="motion-button" aria-pressed={motion} onClick={() => setMotion(!motion)} aria-label={motion ? 'Pause all animations' : 'Play animations'}>{motion ? 'Ⅱ' : '▷'} <span>MOTION {motion ? 'ON' : 'OFF'}</span></button><button className="studio-trigger" onClick={() => setOverlay('studio')}><span aria-hidden="true">✳</span> Scene studio</button></div></header>
    <main>
      <section className="arena" ref={arena} aria-labelledby="arena-heading" onPointerMove={event => {
        if (!motion || event.pointerType === 'touch') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        pointer.current = { x: (event.clientX - bounds.left) / bounds.width * 2 - 1, y: (event.clientY - bounds.top) / bounds.height * 2 - 1 };
        event.currentTarget.style.setProperty('--look-x', `${pointer.current.x * 7}px`);
        event.currentTarget.style.setProperty('--look-y', `${pointer.current.y * 4}px`);
      }} onPointerLeave={() => { pointer.current = { x: 0, y: 0 }; arena.current?.style.setProperty('--look-x', '0px'); arena.current?.style.setProperty('--look-y', '0px'); }}>
        <div className="arena-scene" aria-hidden="true"><SceneBoundary><Suspense fallback={<CityFallback/>}><ArenaScene motion={motion && inView && pageVisible && !overlay} pointer={pointer} quality={quality}/></Suspense></SceneBoundary></div>
        <div className="arena-vignette" aria-hidden="true"/>
        <div className="arena-title"><p className="eyebrow"><span className="signal-dot"/> THE NEXT CHAPTER HAS ENTERED THE ARENA</p><h1 id="arena-heading">Your future.<br/><em>Another dimension.</em></h1><p>A new generation of voices. A shared world of possibility.<br/>Step inside. Find the people ready to shape what’s next.</p></div>
        <span className="arena-side-label side-left" aria-hidden="true">NO LIMITS. JUST NEW POSSIBILITIES.</span><span className="arena-side-label side-right" aria-hidden="true">GOLD / BLUE / BEYOND</span>
        <div id="candidate-stage" className="candidate-stage"><CandidateCarousel candidates={config.candidates} motion={motion} blocked={Boolean(overlay)} inView={inView && pageVisible} onList={() => setOverlay('directory')}/></div>
        <div className="arena-floor-label" aria-hidden="true"><span className="signal-dot"/> VIRTUAL AUDIENCE / A WORLD IN MOTION</div>
        <div className="arena-bottom"><span>PEOPLE FIRST. PROGRESS TOGETHER.</span><a href="#vision">CONTINUE THE JOURNEY <span aria-hidden="true">↓</span></a><span>EXPERIENCE / 001</span></div>
      </section>

      <section id="vision" className="vision-world world-section">
        <div className="section-coordinate">01 / THE BIG IDEA</div><div className="vision-heading"><h2>Change doesn’t<br/>happen from<br/><em>the sidelines.</em></h2><div className="floating-orb" aria-hidden="true"><i/><i/><Emblem image={config.themeImage}/></div></div><div className="glass-panel vision-panel"><span className="panel-corner" aria-hidden="true"/><p className="large-copy">It starts with a conversation.<br/>With an idea.<br/>With someone who decides<br/>things can be better.</p><p>A fresh start is built around a simple belief: our community is strongest when everyone has a part to play. People, ideas, and everyday action can shape what comes next.</p><a className="text-link" href="#priorities">Explore the possibilities <Arrow/></a><span className="content-note">Concept campaign · Illustrative vision and priorities</span></div>
      </section>
      <section id="priorities" className="priorities-world world-section"><div className="section-coordinate">02 / THE POSSIBILITIES</div><div className="section-intro"><h2>Big ideas.<br/><em>Real-world impact.</em></h2><p>Fresh thinking should mean something.<br/>Here are three places to begin.</p></div><div className="orbit-priorities">{[
        ['01', 'Opportunity, closer to home.', 'Practical skills, new connections, and a fair chance to build something that matters.', '↗'],
        ['02', 'Everyday life, made better.', 'Welcoming shared spaces, reliable support, and a community shaped around its people.', '⌘'],
        ['03', 'A future we can grow into.', 'Thoughtful choices today. Stronger foundations for everyone who comes next.', '✳'],
      ].map(([number, title, text, icon], index) => <article className="glass-panel possibility" key={number} style={{ '--delay': `${index * -2}s` }}><div className="possibility-top"><span>IDEA / {number}</span><span aria-hidden="true">{icon}</span></div><h3>{title}</h3><p>{text}</p><a className="text-link" href="#join">Help shape this idea <Arrow/></a></article>)}</div></section>
      <section id="join" className="join-world world-section"><div className="section-coordinate">03 / YOUR PLACE IN THIS WORLD</div><div className="join-heading"><p className="eyebrow">THE NEXT MOVE IS YOURS</p><h2>The future<br/>has room<br/>for <em>you.</em><span aria-hidden="true">↗</span></h2><p>Bring your energy. Bring your ideas.<br/>Let’s build something worth believing in.</p><div className="join-halo" aria-hidden="true"><i/><i/><i/></div></div><JoinForm/></section>
    </main>
    <footer className="space-footer"><a className="space-brand" href="#"><Emblem image={config.themeImage}/><span>UPGRADE<small>RUNACOS</small></span></a><p>A future worth building. Together.</p><span>© {new Date().getFullYear()} · Candidate showcase concept</span><a href="#">BACK TO ORBIT ↑</a></footer>
    <button className="guide-trigger" onClick={() => setOverlay('guide')} aria-label="Open navigation guide"><span>?</span><span>NAVIGATION GUIDE</span></button>
    {toast && <div className="toast" role="status">{toast}<button onClick={() => setToast('')} aria-label="Dismiss message">×</button></div>}
    {overlay === 'guide' && <NavigationGuide onClose={closeGuide}/>}
    {overlay === 'studio' && <SceneStudio config={config} onSave={saveStudio} onClose={() => setOverlay(null)}/>}
    {overlay === 'directory' && <CandidateDirectory candidates={config.candidates} onClose={() => setOverlay(null)}/>}
  </div>;
}
