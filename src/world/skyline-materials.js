import * as THREE from 'three';
import { randomAt } from './campus-layout.mjs';

// Local facade textures keep the distant city detailed without hundreds of lights.
export function createSkylineWindows(accent) {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#152334'; ctx.fillRect(0, 0, 128, 512);
  for (let row = 0; row < 29; row++) {
    for (let column = 0; column < 7; column++) {
      const seed = randomAt(row * 7 + column, accent === 'gold' ? 51 : 47);
      ctx.fillStyle = seed > .28 ? (accent === 'gold' ? `rgba(218, 184, 112, ${.45 + seed * .5})` : `rgba(108, 180, 235, ${.45 + seed * .5})`) : '#0b1726';
      ctx.fillRect(9 + column * 16, 9 + row * 17, 7, 9);
    }
    ctx.fillStyle = '#080f1b'; ctx.fillRect(0, 23 + row * 17, 128, 2);
  }
  ctx.fillStyle = '#080f1b';
  [0, 42, 84, 126].forEach(x => ctx.fillRect(x, 0, 2, 512));
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

export function createHorizonGlow() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 192;
  const ctx = canvas.getContext('2d');
  const blue = ctx.createRadialGradient(182, 118, 0, 182, 118, 220);
  blue.addColorStop(0, 'rgba(60, 105, 155, .58)');
  blue.addColorStop(.4, 'rgba(40, 76, 120, .2)');
  blue.addColorStop(1, 'rgba(16, 28, 43, 0)');
  ctx.fillStyle = blue; ctx.fillRect(0, 0, 512, 192);
  const gold = ctx.createRadialGradient(354, 128, 0, 354, 128, 155);
  gold.addColorStop(0, 'rgba(155, 124, 68, .23)');
  gold.addColorStop(1, 'rgba(16, 28, 43, 0)');
  ctx.fillStyle = gold; ctx.fillRect(0, 0, 512, 192);
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  return map;
}
