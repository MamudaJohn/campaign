import * as THREE from 'three';
import { randomAt } from './campus-layout.mjs';

function texture(canvas) {
  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 4;
  return map;
}

export function createLearningDisplay(kind) {
  const canvas = document.createElement('canvas');
  canvas.width = 768; canvas.height = 480;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#071528'; ctx.fillRect(0, 0, 768, 480);
  ctx.strokeStyle = '#233e59'; ctx.lineWidth = 1;
  for (let x = 0; x < 768; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 480); ctx.stroke(); }
  for (let y = 0; y < 480; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(768, y); ctx.stroke(); }
  ctx.fillStyle = '#b6cedc'; ctx.font = '500 21px monospace';
  ctx.fillText(kind === 'code' ? 'LEARN TO BUILD' : 'CONNECTED KNOWLEDGE', 38, 48);
  ctx.fillStyle = '#b5a16d'; ctx.fillRect(38, 67, 112, 2);
  if (kind === 'code') {
    const lines = ['<learning>', '  curiosity.connect();', '  explore(new Ideas());', '  knowledge.share();', '  build(together);', '</learning>'];
    ctx.font = '22px monospace';
    lines.forEach((line, index) => { ctx.fillStyle = index === 0 || index === 5 ? '#b2a479' : '#81a5bd'; ctx.fillText(line, 48, 135 + index * 46); });
  } else {
    const nodes = [[388, 252], [202, 149], [570, 151], [159, 327], [593, 338], [379, 397], [385, 113]];
    ctx.lineWidth = 2; ctx.strokeStyle = '#527c99';
    nodes.slice(1).forEach(node => { ctx.beginPath(); ctx.moveTo(...nodes[0]); ctx.lineTo(...node); ctx.stroke(); });
    nodes.forEach((node, index) => { ctx.beginPath(); ctx.arc(...node, index === 0 ? 36 : 16, 0, Math.PI * 2); ctx.fillStyle = index === 0 ? '#b3a06c' : '#345975'; ctx.fill(); ctx.strokeStyle = '#8bacbf'; ctx.stroke(); });
    ctx.font = '16px monospace'; ctx.fillStyle = '#acc1ce'; ctx.fillText('ASK. EXPLORE. UNDERSTAND.', 42, 449);
  }
  return texture(canvas);
}

export function createCampusSign(label) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#111d2b'; ctx.fillRect(0, 0, 1024, 128);
  ctx.strokeStyle = '#786f50'; ctx.lineWidth = 2; ctx.strokeRect(6, 6, 1012, 116);
  ctx.font = '500 32px monospace'; ctx.fillStyle = '#c6bb98'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 512, 65, 940);
  return texture(canvas);
}

export function createCourtyardTextures() {
  const size = 256, surface = document.createElement('canvas');
  surface.width = surface.height = size;
  const ctx = surface.getContext('2d'), pixels = ctx.createImageData(size, size);
  for (let index = 0; index < size * size; index++) {
    const shade = 180 + randomAt(index, 9) * 55;
    pixels.data.set([shade, shade, shade, 255], index * 4);
  }
  ctx.putImageData(pixels, 0, 0);
  const roughnessMap = texture(surface);
  roughnessMap.colorSpace = THREE.NoColorSpace;
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(16, 16);
  return { roughnessMap };
}
