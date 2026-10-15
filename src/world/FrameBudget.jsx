import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RENDER_BUDGET } from '../lib/performance.mjs';

// Request at most 30 frames/second, with no animation timer while offscreen.
export default function FrameBudget({ active, onFallback }) {
  const invalidate = useThree(state => state.invalidate);
  const setDpr = useThree(state => state.setDpr);
  const gl = useThree(state => state.gl);
  const samples = useRef({ start: 0, frames: 0, slow: 0, reduced: false, failed: false });
  useEffect(() => {
    gl.shadowMap.needsUpdate = true;
    samples.current.start = performance.now() + 1500;
    samples.current.frames = 0;
    samples.current.slow = 0;
    if (!active) return;
    invalidate();
    const timer = window.setInterval(invalidate, 1000 / RENDER_BUDGET.fps);
    return () => window.clearInterval(timer);
  }, [active, invalidate, gl]);
  useEffect(() => {
    const lost = event => { event.preventDefault(); onFallback?.(); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onFallback]);
  useFrame(() => {
    if (!active || samples.current.failed) return;
    const now = performance.now(), sample = samples.current;
    if (now < sample.start) return;
    sample.frames++;
    const duration = now - sample.start;
    if (duration < 2000) return;
    const fps = sample.frames * 1000 / duration;
    sample.start = now; sample.frames = 0;
    sample.slow = fps < 22 ? sample.slow + 1 : 0;
    if (sample.slow && !sample.reduced) { sample.reduced = true; setDpr(RENDER_BUDGET.lowDpr); }
    else if (sample.slow >= 3) { sample.failed = true; onFallback?.(); }
  });
  return null;
}
