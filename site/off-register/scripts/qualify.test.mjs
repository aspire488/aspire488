import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, qualify } from './qualify.mjs';

const repo = (o = {}) => ({ name: 'r', fork: false, archived: false, description: 'A thing that does a thing', ...o });
const ev = (o = {}) => ({ readmeLength: 2000, languages: { Python: 50000 }, humanCommits: 30, releases: [], tags: [], manifests: [], ...o });
const rel = (o = {}) => ({ tag: 'v1.0.0', date: '2026-01-01', prerelease: false, assets: 1, ...o });
const cfg = { exclude: ['x'], featured: ['f'], archive: ['a'] };

test('exclude beats featured', () => {
  assert.equal(qualify(repo({ name: 'x' }), ev(), { ...cfg, featured: ['x'] }).state, 'excluded');
});
test('forks are fork, archived repos are archived (config or GitHub)', () => {
  assert.equal(qualify(repo({ fork: true }), ev(), cfg).state, 'fork');
  assert.equal(qualify(repo({ name: 'a' }), ev(), cfg).state, 'archived');
  assert.equal(qualify(repo({ archived: true }), ev(), cfg).state, 'archived');
});
test('human-featured repo stays featured even when it is only developing', () => {
  assert.equal(qualify(repo({ name: 'f', description: '' }), ev({ readmeLength: 0, humanCommits: 1 }), cfg).state, 'featured');
});
test('app needs a non-prerelease release with an asset', () => {
  const app = { languages: { Kotlin: 90000 } };
  assert.equal(qualify(repo(), ev({ ...app, releases: [rel({ assets: 0 })] }), cfg).state, 'developing');
  assert.equal(qualify(repo(), ev({ ...app, releases: [rel({ prerelease: true })] }), cfg).state, 'developing');
  assert.equal(qualify(repo(), ev({ ...app, releases: [rel()] }), cfg).state, 'shipped');
});
test('library: a semver tag counts as shipping', () => {
  const lib = { manifests: ['pyproject.toml'], tags: ['v0.1.0'] };
  assert.equal(classify(repo(), ev(lib)), 'library');
  assert.equal(qualify(repo(), ev(lib), cfg).state, 'shipped');
  assert.equal(qualify(repo(), ev({ ...lib, tags: ['nightly'] }), cfg).state, 'developing');
});
test('web needs a verified live URL to ship', () => {
  const web = { manifests: ['index.html'], languages: { JavaScript: 60000 } };
  assert.equal(qualify(repo(), ev(web), cfg).state, 'developing');
  const live = qualify(repo(), ev({ ...web, liveUrl: 'https://x.example' }), cfg);
  assert.equal(live.state, 'shipped');
  assert.equal(live.type, 'web');
  assert.ok(live.evidence.includes('live: https://x.example'));
});
test('an unfinished repo is never featured automatically', () => {
  for (const o of [{ readmeLength: 100 }, { humanCommits: 3 }, { languages: { Python: 500 } }]) {
    assert.equal(qualify(repo(), ev(o), cfg).state, 'discovered');
  }
  assert.equal(qualify(repo({ description: '' }), ev(), cfg).state, 'discovered');
});
test('evidence strings are human readable', () => {
  const r = qualify(repo(), ev({ releases: [rel({ tag: 'v1.1', date: '2026-10-18' })], testFiles: 42, workflows: 1, ciConclusion: 'success', readmeLength: 6800, humanCommits: 63 }), cfg);
  for (const s of ['release v1.1 (2026-10-18)', 'tests: 42 files', 'CI: passing', 'README 6.8 kB', 'commits: 63']) assert.ok(r.evidence.includes(s), s);
});
