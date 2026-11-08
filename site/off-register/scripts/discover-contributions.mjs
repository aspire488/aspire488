// Counts aspire488's pull requests into other people's repos and writes data/contributions.json.
// Fails closed: if the search comes back empty or far smaller than last time, the old file stays.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { graphql } from './lib/github.mjs';

const dataDir = new URL('../data/', import.meta.url);
const QUERY = 'is:pr author:aspire488 -user:aspire488';

const SEARCH = `query($q: String!, $after: String) {
  search(query: $q, type: ISSUE, first: 100, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes { ... on PullRequest { number title url state merged isDraft mergedAt additions deletions repository { nameWithOwner } } }
  }
}`;

// merged wins, then closed (a closed draft is closed), then draft, else open
export const prState = (pr) => (pr.merged ? 'merged' : pr.state === 'CLOSED' ? 'closed' : pr.isDraft ? 'draft' : 'open');

export function build(prs, groups, warn = console.warn) {
  const counts = { merged: 0, open: 0, draft: 0, closed: 0 };
  const index = new Map();
  for (const pr of prs) { counts[prState(pr)]++; index.set(`${pr.repository.nameWithOwner}#${pr.number}`, pr); }

  const featured = [];
  for (const g of groups) {
    const kept = [];
    for (const n of g.prs) {
      const pr = index.get(`${g.repo}#${n}`);
      if (!pr || prState(pr) !== 'merged') { warn(`${g.repo}#${n} is not a merged PR (${pr ? prState(pr) : 'not found'}); dropped from the featured group`); continue; }
      kept.push({ number: pr.number, title: pr.title, url: pr.url, additions: pr.additions, deletions: pr.deletions, mergedAt: pr.mergedAt });
    }
    if (!kept.length) { warn(`${g.repo}: no merged PRs left, group dropped`); continue; }
    kept.sort((a, b) => (b.number === g.lead) - (a.number === g.lead)); // stable: lead first, config order otherwise
    featured.push({ repo: g.repo, name: g.name, kind: g.kind, note: g.note, prs: kept });
  }
  return {
    counts, featured,
    atlas: 'https://github.com/aspire488/oss-atlas',
    all: `https://github.com/search?q=${encodeURIComponent(QUERY)}&type=pullrequests`,
  };
}

export function validate(next, previous) {
  const total = Object.values(next.counts).reduce((a, b) => a + b, 0);
  if (total < 1) throw new Error('search returned no pull requests');
  if (next.featured.length < 1) throw new Error('no featured group has a merged PR');
  const before = previous ? Object.values(previous.counts).reduce((a, b) => a + b, 0) : 0;
  if (total < before * 0.7) throw new Error(`total fell from ${before} to ${total} (more than 30%)`);
}

async function main() {
  const groups = JSON.parse(readFileSync(new URL('contributions.config.json', dataDir), 'utf8'));
  const prs = [];
  for (let after = null; ;) {
    const { search } = await graphql(SEARCH, { q: QUERY, after });
    prs.push(...search.nodes.filter((n) => n.number));
    if (!search.pageInfo.hasNextPage) break;
    after = search.pageInfo.endCursor;
  }
  const file = new URL('contributions.json', dataDir);
  const old = existsSync(file) ? readFileSync(file, 'utf8') : null;
  const next = build(prs, groups);
  validate(next, old && JSON.parse(old));
  const out = JSON.stringify(next, null, 2) + '\n';
  if (out === old) return console.log('contributions.json unchanged');
  writeFileSync(file, out);
  console.log('contributions.json written');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(`::error::discover-contributions failed: ${e.message}`); process.exit(1); });
}
