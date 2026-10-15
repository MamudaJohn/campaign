import * as THREE from 'three';
import { randomAt } from './city-layout.mjs';

function textureFrom(canvas, repeat = 1, color = true) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.anisotropy = 4;
  return texture;
}

// Local procedural textures: no remote HDRs, models, or image downloads.
export function createFacadeTextures(variant) {
  const facade = document.createElement('canvas'), glow = document.createElement('canvas');
  facade.width = glow.width = 256; facade.height = glow.height = 768;
  const surface = facade.getContext('2d'), emission = glow.getContext('2d');
  surface.fillStyle = ['#122033', '#162439', '#171f2c', '#102236'][variant]; surface.fillRect(0, 0, 256, 768);
  emission.fillStyle = '#000'; emission.fillRect(0, 0, 256, 768);
  for (let row = 0; row < 54; row++) {
    for (let column = 0; column < 10; column++) {
      const seed = row * 10 + column + variant * 900;
      const occupied = randomAt(seed, 7) > .44;
      const x = column * 25 + 6, y = row * 14 + 3;
      const warmth = randomAt(seed, 8);
      surface.fillStyle = occupied ? (warmth > .6 ? '#796649' : '#34516c') : '#081220';
      surface.fillRect(x, y, 15, 8);
      if (occupied) {
        emission.fillStyle = warmth > .6 ? `rgba(255,211,137,${.35 + randomAt(seed, 3) * .65})` : `rgba(124,185,255,${.25 + randomAt(seed, 3) * .6})`;
        emission.fillRect(x, y, 15, 8);
        if (column % 3 === 0) { emission.fillStyle = '#050810'; emission.fillRect(x + 7, y, 1, 8); }
      }
    }
    surface.fillStyle = '#060b14'; surface.fillRect(0, row * 14 + 12, 256, 2);
    if (row % 9 === 0) { surface.fillStyle = '#26374b'; surface.fillRect(0, row * 14, 256, 3); }
  }
  return { map: textureFrom(facade), emissiveMap: textureFrom(glow) };
}

export function createPlazaTextures() {
  const size = 256, rough = document.createElement('canvas'), normal = document.createElement('canvas');
  rough.width = normal.width = size; rough.height = normal.height = size;
  const roughContext = rough.getContext('2d'), normalContext = normal.getContext('2d');
  const roughData = roughContext.createImageData(size, size), normalData = normalContext.createImageData(size, size);
  for (let index = 0; index < size * size; index++) {
    const grain = randomAt(index, 15);
    const value = 110 + grain * 85;
    roughData.data.set([value, value, value, 255], index * 4);
    normalData.data.set([125 + grain * 6, 125 + randomAt(index, 16) * 6, 255, 255], index * 4);
  }
  roughContext.putImageData(roughData, 0, 0); normalContext.putImageData(normalData, 0, 0);
  return { roughnessMap: textureFrom(rough, 24, false), normalMap: textureFrom(normal, 24, false) };
}
