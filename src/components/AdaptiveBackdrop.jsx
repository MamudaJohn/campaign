import React, { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import CampusFallback from './CampusFallback.jsx';
import { chooseBackdrop } from '../lib/performance.mjs';

const ArenaScene = lazy(() => import('../ArenaScene.jsx'));

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFallback?.(); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

function LightBackdrop({ active }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current?.querySelectorAll('svg').forEach(svg => {
      if (active) svg.unpauseAnimations?.();
      else svg.pauseAnimations?.();
    });
  }, [active]);
  return <div ref={ref} className="light-backdrop" data-active={active}>
    <CampusFallback/>
    <svg className="light-stage" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <ellipse className="light-stage-shadow" cx="720" cy="170" rx="245" ry="43"/>
      <path className="light-stage-body" d="M486 110v21c0 68 468 68 468 0v-21Z"/>
      <ellipse className="light-stage-surface" cx="720" cy="110" rx="234" ry="55"/>
      <ellipse className="light-stage-ring" cx="720" cy="110" rx="220" ry="48"/>
      <ellipse className="light-stage-ring gold" cx="720" cy="110" rx="194" ry="40"/>
      <g className="light-crowd">{Array.from({ length: 56 }, (_, index) => {
        const row = Math.floor(index / 28), x = 360 + index % 28 * 27, y = 230 + row * 48;
        return <g key={index} transform={`translate(${x} ${y})`}><circle cy="-33" r="7"/><path d="M-7 4v-24q7-9 14 0V4M-7-17l-13-19M7-17l13-19M-4 4v16M4 4v16"/></g>;
      })}</g>
    </svg>
  </div>;
}

export default function AdaptiveBackdrop({ active, pointer }) {
  const [mode, setMode] = useState('light');
  const [ready, setReady] = useState(false);
  const rejected = useRef(false);
  const fallBack = useCallback(() => { rejected.current = true; setMode('light'); }, []);
  useEffect(() => {
    const select = () => {
      if (rejected.current) return;
      const connection = navigator.connection;
      setMode(chooseBackdrop({ width: window.innerWidth, coarsePointer: window.matchMedia?.('(pointer: coarse)').matches || false, memory: navigator.deviceMemory, cores: navigator.hardwareConcurrency, saveData: connection?.saveData, effectiveType: connection?.effectiveType }));
    };
    select();
    window.addEventListener('resize', select, { passive: true });
    return () => window.removeEventListener('resize', select);
  }, []);
  useEffect(() => {
    if (mode !== '3d' || !active || ready) return;
    if ('requestIdleCallback' in window) {
      const task = window.requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => window.cancelIdleCallback(task);
    }
    const task = window.setTimeout(() => setReady(true), 800);
    return () => window.clearTimeout(task);
  }, [mode, active, ready]);
  const light = <LightBackdrop active={active}/>;
  return <div className="adaptive-backdrop" data-render-mode={mode === '3d' && ready ? '3d' : 'light'}>
    {mode === '3d' && ready ? <SceneBoundary fallback={light} onFallback={fallBack}><Suspense fallback={light}><ArenaScene motion={active} pointer={pointer} onFallback={fallBack}/></Suspense></SceneBoundary> : light}
  </div>;
}
