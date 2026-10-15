// Keep the main experience independent of WebGL on phones and constrained devices.
export function chooseBackdrop({ width = 1280, coarsePointer = false, memory, cores, saveData = false, effectiveType = '' } = {}) {
  return width <= 900 || coarsePointer || (memory > 0 && memory <= 4) || (cores > 0 && cores <= 4) || saveData || ['slow-2g', '2g'].includes(effectiveType) ? 'light' : '3d';
}

export const RENDER_BUDGET = Object.freeze({ fps: 30, dpr: 1.1, lowDpr: .8, shadowSize: 1024, audience: 84 });
