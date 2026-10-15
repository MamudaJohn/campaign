import { test } from 'node:test';
import assert from 'node:assert/strict';
import { campaign } from '../src/data/campaign.js';

test('campaign.js defines one campaign with uniquely addressable candidate profiles', () => {
  assert.ok(campaign && !Array.isArray(campaign));
  assert.ok(Array.isArray(campaign.candidates) && campaign.candidates.length > 0);
  assert.equal(new Set(campaign.candidates.map(candidate => candidate.id)).size, campaign.candidates.length);
  campaign.candidates.forEach(candidate => {
    for (const field of ['id', 'name', 'position', 'statement', 'detail', 'image', 'link', 'initials']) {
      assert.equal(typeof candidate[field], 'string', `${candidate.id}: ${field} must be authored in campaign.js`);
    }
    assert.ok(candidate.id && candidate.name && candidate.position);
    assert.equal(typeof candidate.configured, 'boolean');
  });
});
