import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chooseBackdrop } from '../src/lib/performance.mjs';

test('phones, touch devices, data savers, and constrained computers use the animated lightweight scene', () => {
  for (const device of [{ width: 390 }, { width: 900 }, { width: 1400, coarsePointer: true }, { memory: 4 }, { cores: 4 }, { saveData: true }, { effectiveType: '2g' }]) assert.equal(chooseBackdrop(device), 'light');
});

test('capable desktops can load deferred 3D without requiring optional device APIs', () => {
  assert.equal(chooseBackdrop({ width: 1440, memory: 8, cores: 8 }), '3d');
  assert.equal(chooseBackdrop({ width: 1280 }), '3d');
});
