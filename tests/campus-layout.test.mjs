import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCampusLayout, createSkylineLayout, randomAt } from '../src/world/campus-layout.mjs';

test('the campus has low academic wings and a library with valid dimensions', () => {
  const campus = createCampusLayout();
  assert.deepEqual(campus, createCampusLayout());
  assert.equal(new Set(campus.map(building => building.id)).size, campus.length);
  assert.ok(campus.some(building => building.kind === 'library'));
  assert.ok(campus.some(building => building.kind === 'lab'));
  campus.forEach(building => {
    assert.ok([building.x, building.z, building.width, building.depth, building.height].every(Number.isFinite));
    assert.ok(building.width > 0 && building.depth > 0 && building.height > 0);
    assert.ok(building.height <= 7, `${building.id} should remain below the old skyline`);
    assert.ok(building.label.length > 0);
  });
});

test('academic buildings preserve the stage clearance and central sightline', () => {
  createCampusLayout().forEach(building => {
    const nearestX = Math.max(0, Math.abs(building.x) - building.width / 2);
    const nearestZ = Math.max(0, Math.abs(building.z) - building.depth / 2);
    assert.ok(Math.hypot(nearestX, nearestZ) > 5.6, `${building.id} intersects the stage`);
    if (building.z > -30) assert.ok(nearestX > 7, `${building.id} blocks the candidate sightline`);
  });
});

test('procedural surface seeds stay in the expected range', () => {
  for (let index = 0; index < 200; index++) {
    const value = randomAt(index, 9);
    assert.ok(value >= 0 && value < 1);
  }
});

test('the skyline has tall side towers behind the campus and a lower central row', () => {
  const skyline = createSkylineLayout();
  assert.deepEqual(skyline, createSkylineLayout());
  assert.equal(new Set(skyline.map(building => building.id)).size, skyline.length);
  assert.ok(skyline.some(building => building.layer === 'near'));
  assert.ok(skyline.some(building => building.layer === 'far'));
  assert.ok(skyline.filter(building => building.layer === 'near').every(building => building.height > 19));
  skyline.forEach(building => {
    assert.ok([building.x, building.z, building.width, building.depth, building.height].every(Number.isFinite));
    assert.ok(building.width > 0 && building.depth > 0 && building.height > 0);
    assert.ok(building.height <= 30, `${building.id} overwhelms the campus`);
    assert.ok(building.z + building.depth / 2 < -34, `${building.id} intrudes into the foreground`);
    if (Math.abs(building.x) < 10) {
      assert.ok(building.z < -60 && building.height < 15, `${building.id} blocks the center of the scene`);
    }
  });
});
