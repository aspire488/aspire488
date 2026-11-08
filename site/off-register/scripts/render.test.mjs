import test from 'node:test';
import assert from 'node:assert/strict';
import { renderFeatured, renderMore, renderUpstream, injectMarkers } from './render.mjs';

const proj = (o = {}) => ({ repo: 'r', title: 'R', what: 'does a thing', stack: 'Python', status: 'shipped v1', url: 'https://github.com/aspire488/r', demo: null, page: null, release: null, visual: null, links: [], ...o });

test('escapes HTML in every text field', () => {
  const html = renderFeatured([proj({ title: '<b>x</b>', what: 'a & "b"', stack: '<i>', status: "it's" })]);
  assert.ok(!html.includes('<b>x'));
  assert.ok(html.includes('&lt;b&gt;x&lt;/b&gt;') && html.includes('a &amp; &quot;b&quot;') && html.includes('it&#39;s'));
  assert.ok(renderMore([proj({ title: '<script>' })]).includes('&lt;script&gt;'));
});
test('external links get target and rel; internal ones do not', () => {
  const html = renderFeatured([proj({ page: './r/', links: [{ label: 'how', href: './r/' }, { label: 'GitHub', href: 'https://github.com/aspire488/r' }] })]);
  assert.match(html, /<a href="\.\/r\/">how<\/a>/);
  assert.match(html, /<a href="https:\/\/github\.com\/aspire488\/r" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">&#8599;<\/span><\/a>/);
});
test('no visual: no img and no art link', () => {
  const html = renderFeatured([proj()]);
  assert.ok(!html.includes('<img') && !html.includes('bench-art"'));
  assert.ok(html.includes('class="bench-name"'));
});
test('visual present: art link is the first child of the li', () => {
  const html = renderFeatured([proj({ visual: 'art/r.svg' })]);
  assert.match(html, /<li>\s*<a class="bench-art" href="https:\/\/github\.com\/aspire488\/r" tabindex="-1" aria-hidden="true"><img src="\.\/art\/r\.svg" alt="" width="120" height="120" loading="lazy"><\/a>/);
});
test('compact row: link, what, and a status stamp only when the status names a state', () => {
  const html = renderMore([proj({ status: 'built, not verified. last touched June 2026.' }), proj({ status: 'observed, implemented.' })]);
  assert.match(html, /<span class="more-stamp" data-state="unverified">unverified<\/span><span class="more-meta">built, not verified\. last touched June 2026\.<\/span>/);
  assert.equal(html.match(/more-stamp/g).length, 1);
});
test('upstream block', () => {
  const html = renderUpstream({
    counts: { merged: 2, open: 3, draft: 1, closed: 4 }, atlas: 'https://github.com/aspire488/oss-atlas',
    featured: [{ repo: 'o/r', name: 'R', kind: 'k', note: 'n <x>', prs: [{ number: 5, title: 'fix "y"', url: 'https://github.com/o/r/pull/5' }] }],
  });
  assert.ok(html.includes('data-repo="o/r"') && html.includes('<b>1</b> merged') && html.includes('n &lt;x&gt;'));
  assert.ok(html.includes('title="fix &quot;y&quot;"'));
  assert.ok(html.includes('2 merged, 3 open (drafts counted separately: 1), 4 closed without merging'));
});
test('markers are replaced; absent markers never read data', () => {
  const never = () => { throw new Error('should not load'); };
  assert.equal(injectMarkers('<p>none</p>', { projects: never, contributions: never }), '<p>none</p>');
  const out = injectMarkers('<ul><!--@more--></ul>', { projects: () => ({ more: [proj()] }), contributions: never });
  assert.ok(out.includes('class="more-name"') && !out.includes('<!--@'));
});
