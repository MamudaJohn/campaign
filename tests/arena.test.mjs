import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrapIndex, relativePosition, candidateDestination, restoreConfig, safeImage } from '../src/lib/arena.mjs';

test('candidate navigation wraps in both directions without an empty-array failure', () => {
  assert.equal(wrapIndex(-1, 5), 4);
  assert.equal(wrapIndex(5, 5), 0);
  assert.equal(wrapIndex(-12, 5), 3);
  assert.equal(wrapIndex(3, 0), 0);
});

test('the circular stage keeps exactly one front card across all rotations', () => {
  for (let active = 0; active < 5; active++) {
    const offsets = Array.from({ length: 5 }, (_, index) => relativePosition(index, active, 5));
    assert.equal(offsets[active], 0);
    assert.deepEqual([...offsets].sort((a, b) => a - b), [-2, -1, 0, 1, 2]);
  }
  assert.equal(relativePosition(0, 4, 5), 1);
  assert.equal(relativePosition(4, 0, 5), -1);
});

test('candidate cards open valid campaign URLs or their built-in profile', () => {
  assert.equal(candidateDestination({ id: 'john-mamuda', link: '' }), '?candidate=john-mamuda');
  assert.equal(candidateDestination({ id: 'candidate 02', link: '' }), '?candidate=candidate%2002');
  assert.equal(candidateDestination({ id: 'test', link: 'https://example.com/campaign' }), 'https://example.com/campaign');
  assert.equal(candidateDestination({ id: 'test', link: 'javascript:alert(1)' }), '?candidate=test');
  assert.equal(candidateDestination({ id: 'test', link: 'data:text/html,hello' }), '?candidate=test');
});

test('image slots accept local assets, HTTPS and uploaded raster data', () => {
  assert.equal(safeImage('/images/theme.png'), '/images/theme.png');
  assert.equal(safeImage('https://example.com/portrait.jpg'), 'https://example.com/portrait.jpg');
  assert.equal(safeImage('data:image/png;base64,aGVsbG8='), 'data:image/png;base64,aGVsbG8=');
  assert.equal(safeImage('javascript:alert(1)'), '');
  assert.equal(safeImage('//unconfigured.example/image.png'), '');
  assert.equal(safeImage('data:image/svg+xml;base64,aGVsbG8='), '');
});

test('saved studio content is restored by stable candidate ID and bounded safely', () => {
  const defaults = { themeImage: '', candidates: [{ id: 'one', name: 'Original', position: 'Director', statement: 'Ready', detail: 'Details', initials: '01', configured: false, image: '', link: '' }] };
  assert.equal(restoreConfig(null, defaults), defaults);
  const restored = restoreConfig({ themeImage: 'javascript:bad', candidates: [{ id: 'one', name: '  Updated  ', statement: 'a'.repeat(400), image: '/images/one.png', configured: true }, { id: 'unknown', name: 'Unexpected' }] }, defaults);
  assert.equal(restored.candidates.length, 1);
  assert.equal(restored.candidates[0].name, 'Updated');
  assert.equal(restored.candidates[0].position, 'Director');
  assert.equal(restored.candidates[0].statement.length, 240);
  assert.equal(restored.candidates[0].image, '/images/one.png');
  assert.equal(restored.candidates[0].configured, true);
  assert.equal(restored.themeImage, '');
});
