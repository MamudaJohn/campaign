import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageMetadata, indexableCandidates, metadataTags } from '../src/lib/seo.mjs';
import { candidateIdFromLocation } from '../src/lib/arena.mjs';

const person = { id: 'john-mamuda', name: 'John Mamuda', position: 'ICT Director', configured: true, statement: 'Digital learning and practical skills.', detail: 'Full profile.', image: '/images/JohnMamuda.jpg' };
const copy = { ...person, id: 'john-mamuda-2' };
const pending = { ...person, id: 'new-candidate', name: 'Candidate slot', configured: false };
const config = { candidates: [person, copy, pending] };

test('canonical profiles use the public domain and consolidate identical copied templates', () => {
  assert.equal(pageMetadata(config, person).canonical, 'https://mamudajohn.com/candidates/john-mamuda/');
  assert.equal(pageMetadata(config, copy).canonical, pageMetadata(config, person).canonical);
  assert.deepEqual(indexableCandidates(config), [person]);
  assert.match(pageMetadata(config, pending).robots, /noindex/);
  assert.match(pageMetadata(config, null, true).robots, /noindex/);
});

test('clean URLs and previously shared query URLs resolve to the same candidate', () => {
  assert.equal(candidateIdFromLocation({ pathname: '/candidates/john-mamuda/' }), person.id);
  assert.equal(candidateIdFromLocation({ search: '?candidate=john-mamuda' }), person.id);
  assert.equal(candidateIdFromLocation({ pathname: '/' }), null);
  assert.equal(candidateIdFromLocation({ pathname: '/candidates/%zz/' }), null);
});

test('authored candidate content cannot break metadata attributes or JSON-LD scripts', () => {
  const hostile = { ...person, name: '"><script>bad</script>', statement: '</script><script>bad</script>' };
  const tags = metadataTags(pageMetadata({ candidates: [hostile] }, hostile));
  assert.ok(!tags.includes('<script>bad'));
  const json = tags.match(/type="application\/ld\+json">([\s\S]+?)<\/script>/)[1];
  assert.equal(JSON.parse(json).mainEntity.name, hostile.name);
});
