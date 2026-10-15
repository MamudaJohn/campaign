import { build } from 'vite';
import { prerender } from './prerender.mjs';

await build({ build: { manifest: true } });
await prerender();
await import('./verify-production.mjs');
