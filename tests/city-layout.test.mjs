import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCityLayout, randomAt } from '../src/world/city-layout.mjs';

test('the city layout is reproducible and all towers have valid dimensions', () => {
  const towers = createCityLayout();
  assert.deepEqual(towers, createCityLayout());
  assert.equal(new Set(towers.map(tower => tower.id)).size, towers.length);
  assert.ok(towers.length > 30);
  towers.forEach(tower => {
    assert.ok([tower.x, tower.z, tower.height, tower.width, tower.depth].every(Number.isFinite));
    assert.ok(tower.width > 0 && tower.depth > 0 && tower.height > 0);
    assert.ok(tower.variant >= 0 && tower.variant <= 3);
  });
});

test('building footprints leave the stage and its approach unobstructed', () => {
  createCityLayout().forEach(tower => {
    const nearestX = Math.max(0, Math.abs(tower.x) - tower.width / 2);
    const nearestZ = Math.max(0, Math.abs(tower.z) - tower.depth / 2);
    assert.ok(Math.hypot(nearestX, nearestZ) > 5.6, `Tower ${tower.id} intersects the stage clearance`);
    if (tower.z > -30) assert.ok(nearestX > 6, `Tower ${tower.id} blocks the central sightline`);
  });
});

test('procedural material seeds remain in the expected range', () => {
  for (let index = 0; index < 200; index++) {
    const value = randomAt(index, 7);
    assert.ok(value >= 0 && value < 1);
  }
});
