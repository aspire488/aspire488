import test from 'node:test';
import assert from 'node:assert/strict';
import { prState, build, validate } from './discover-contributions.mjs';

const pr = (n, o = {}) => ({ number: n, title: `pr ${n}`, url: `https://github.com/o/r/pull/${n}`, state: 'OPEN', merged: false, isDraft: false, mergedAt: null, additions: 1, deletions: 2, repository: { nameWithOwner: 'o/r' }, ...o });
const merged = (n) => pr(n, { merged: true, state: 'MERGED' });

test('state mapping order: merged, closed, draft, open', () => {
  assert.equal(prState(merged(1)), 'merged');
  assert.equal(prState(pr(2, { state: 'CLOSED', isDraft: true })), 'closed');
  assert.equal(prState(pr(3, { isDraft: true })), 'draft');
  assert.equal(prState(pr(4)), 'open');
});
test('counts, and featured PRs kept only when merged', () => {
  const warnings = [];
  const prs = [merged(1), merged(2), pr(3, { state: 'CLOSED' }), pr(4)];
  const out = build(prs, [{ repo: 'o/r', name: 'R', kind: 'k', note: 'n', prs: [1, 3, 4, 99, 2], lead: 2 }], (m) => warnings.push(m));
  assert.deepEqual(out.counts, { merged: 2, open: 1, draft: 0, closed: 1 });
  assert.deepEqual(out.featured[0].prs.map((p) => p.number), [2, 1]);
  assert.equal(warnings.length, 3);
});
test('a group with no merged PR is dropped', () => {
  const out = build([pr(3, { state: 'CLOSED' })], [{ repo: 'o/r', name: 'R', kind: 'k', note: 'n', prs: [3] }], () => {});
  assert.equal(out.featured.length, 0);
});
test('validation rejects empty results and a drop of more than 30 percent', () => {
  const c = (merged) => ({ merged, open: 0, draft: 0, closed: 0 });
  const ok = { counts: c(10), featured: [{}] };
  assert.throws(() => validate({ counts: c(0), featured: [] }, null));
  assert.throws(() => validate({ ...ok, featured: [] }, null));
  assert.throws(() => validate(ok, { counts: c(20) }));
  assert.doesNotThrow(() => validate(ok, { counts: c(12) }));
});
