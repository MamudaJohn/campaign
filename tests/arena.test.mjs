import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrapIndex, relativePosition, candidateDestination, candidateCampaignLink } from '../src/lib/arena.mjs';

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

test('candidate cards always open the detail page, including candidates with campaign links', () => {
  assert.equal(candidateDestination({ id: 'john-mamuda', link: '' }), '?candidate=john-mamuda');
  assert.equal(candidateDestination({ id: 'candidate 02', link: '' }), '?candidate=candidate%2002');
  assert.equal(candidateDestination({ id: 'test', link: 'https://example.com/campaign' }), '?candidate=test');
  assert.equal(candidateDestination({ id: 'test', link: 'javascript:alert(1)' }), '?candidate=test');
  assert.equal(candidateDestination({ id: 'test', link: 'data:text/html,hello' }), '?candidate=test');
});

test('the detail-page campaign button accepts web destinations and omits missing or invalid links', () => {
  assert.equal(candidateCampaignLink({ link: 'https://example.com/campaign' }), 'https://example.com/campaign');
  assert.equal(candidateCampaignLink({ link: ' https://example.com/campaign ' }), 'https://example.com/campaign');
  assert.equal(candidateCampaignLink({ link: 'http://example.com/' }), 'http://example.com/');
  for (const link of ['', '  ', undefined, 'invalid', 'javascript:alert(1)', 'data:text/html,hello']) assert.equal(candidateCampaignLink({ link }), '');
});
