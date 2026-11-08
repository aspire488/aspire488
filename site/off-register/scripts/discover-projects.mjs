// Reads aspire488's repos from GitHub, decides what is shipped (scripts/qualify.mjs) and writes data/projects.json.
// Any failed fetch or failed validation exits 1 without writing, so the last valid file stays in place.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { gh, countPages, isLive } from './lib/github.mjs';
import { qualify } from './qualify.mjs';

const OWNER = 'aspire488';
const PREFIX = `https://github.com/${OWNER}/`;
const dataDir = new URL('../data/', import.meta.url);
const TEST_RE = /(^|\/)(tests?|__tests__|spec)\/|\.test\.|_test\.|(^|\/)test_[^/]*\.py$/;
const MANIFEST_RE = /(^|\/)(package\.json|pyproject\.toml|setup\.py|index\.html|build\.gradle(\.kts)?|pom\.xml)$/;
const day = (iso) => (iso ?? '').slice(0, 10);

async function paginate(path) {
  const all = [];
  for (let page = 1; ; page++) {
    const batch = await gh(`${path}${path.includes('?') ? '&' : '?'}per_page=100&page=${page}`);
    all.push(...batch);
    if (batch.length < 100) return all;
  }
}

// an empty repo answers 409 on trees and commits; that is "nothing there", not a failure
const orEmpty = (p, empty) => p.catch((e) => { if (/ 409 /.test(e.message)) return empty; throw e; });

async function gather(repo, config) {
  const r = `/repos/${OWNER}/${repo.name}`;
  const branch = repo.default_branch;
  const ov = config.overrides?.[repo.name] ?? {};

  const readme = await gh(`${r}/readme`, { allow404: true });
  const languages = await gh(`${r}/languages`);
  const releases = (await gh(`${r}/releases?per_page=10`)).map((x) => ({ tag: x.tag_name, date: day(x.published_at), prerelease: x.prerelease, assets: x.assets.length }));
  const tags = (await gh(`${r}/tags?per_page=20`)).map((t) => t.name);
  const tree = (await orEmpty(gh(`${r}/git/trees/${encodeURIComponent(branch)}?recursive=1`, { allow404: true }), { tree: [] }))?.tree ?? [];
  const paths = tree.filter((t) => t.type === 'blob').map((t) => t.path);

  const since = new Date(Date.now() - 365 * 864e5).toISOString();
  const commitsPath = `${r}/commits?sha=${encodeURIComponent(branch)}&since=${since}`;
  const commits = await orEmpty(gh(`${commitsPath}&per_page=100`), []);
  const human = commits.filter((c) => !c.author?.login?.endsWith('[bot]'));
  // a full page means "100 or more": take the real total (bots are rare enough not to matter once past the 10 threshold)
  const humanCommits = commits.length === 100 ? await countPages(commitsPath) : human.length;
  const updated = day((human[0] ?? commits[0])?.commit.committer.date) || day(repo.pushed_at);

  const workflows = paths.filter((p) => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(p)).length;
  const runs = workflows ? await gh(`${r}/actions/runs?per_page=1&branch=${encodeURIComponent(branch)}`, { allow404: true }) : null;

  let pkg = null;
  if (paths.includes('package.json')) {
    const f = await gh(`${r}/contents/package.json?ref=${encodeURIComponent(branch)}`, { allow404: true });
    try { pkg = JSON.parse(Buffer.from(f?.content ?? '', 'base64').toString('utf8')); } catch { pkg = null; }
  }

  const pagesUrl = repo.has_pages ? `https://${OWNER}.github.io/${repo.name}/` : null;
  let liveUrl = null;
  for (const url of [repo.homepage, pagesUrl, ov.demo]) {
    if (url && await isLive(url)) { liveUrl = url; break; }
  }

  return {
    readmeLength: readme?.size ?? 0, languages, releases, tags, humanCommits, updated, workflows,
    testFiles: paths.filter((p) => TEST_RE.test(p)).length,
    ciConclusion: runs?.workflow_runs?.[0]?.conclusion ?? null,
    manifests: paths.filter((p) => MANIFEST_RE.test(p)), pkg, liveUrl,
  };
}

const pretty = (name) => name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export function toProject(repo, ev, { type, evidence }, ov = {}) {
  const langs = Object.entries(ev.languages).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n]) => n);
  const rel = ev.releases.find((x) => !x.prerelease);
  return {
    repo: repo.name,
    title: ov.title ?? pretty(repo.name),
    what: ov.what ?? repo.description ?? '',
    stack: ov.stack ?? langs.join(', '),
    status: ov.status ?? ['shipped', rel?.tag].filter(Boolean).join(' '),
    url: PREFIX + repo.name,
    demo: /^https:\/\//.test(ev.liveUrl ?? '') ? ev.liveUrl : null,
    page: ov.page ?? null,
    release: rel ? { tag: rel.tag, date: rel.date } : null,
    category: type,
    languages: langs,
    updated: ev.updated,
    evidence,
    visual: ov.visual ?? null,
    links: ov.links ?? [],
  };
}

// Pure: turns gathered facts into the output file content. Throws on anything that must not ship.
export function build(repos, config) {
  const states = {}; const results = {};
  for (const { repo, ev } of repos) {
    results[repo.name] = qualify(repo, ev, config);
    states[repo.name] = results[repo.name].state;
  }
  const byName = Object.fromEntries(repos.map((x) => [x.repo.name, x]));
  const make = (name) => toProject(byName[name].repo, byName[name].ev, results[name], config.overrides?.[name]);
  const featuredNames = config.featured.filter((n) => !config.exclude.includes(n));
  const featured = featuredNames.map((n) => {
    if (!byName[n]) throw new Error(`featured repo "${n}" not found among ${OWNER}'s repos`);
    return make(n);
  });
  for (const n of config.pinned) if (!byName[n] && !config.exclude.includes(n)) throw new Error(`pinned repo "${n}" not found among ${OWNER}'s repos`);
  const pinned = config.pinned.filter((n) => !featuredNames.includes(n) && !config.exclude.includes(n));
  const auto = Object.keys(states)
    .filter((n) => states[n] === 'shipped' && !pinned.includes(n))
    .map(make).sort((a, b) => b.updated.localeCompare(a.updated) || a.repo.localeCompare(b.repo));
  const more = [...pinned.map(make), ...auto];

  if (featured.length !== featuredNames.length) throw new Error('featured count mismatch');
  for (const p of [...featured, ...more]) {
    if (!p.url.startsWith(PREFIX)) throw new Error(`${p.repo}: url outside ${PREFIX}`);
    if (!p.title.trim() || !p.what.trim()) throw new Error(`${p.repo}: empty title or description`);
  }
  return { featured, more, states: Object.fromEntries(Object.entries(states).sort(([a], [b]) => a.localeCompare(b))) };
}

async function main() {
  const config = JSON.parse(readFileSync(new URL('projects.config.json', dataDir), 'utf8'));
  const list = await paginate(`/users/${OWNER}/repos?type=owner`);
  const repos = [];
  for (const repo of list) {
    // forks and excluded repos need no evidence: qualify() stops at them
    const skip = repo.fork || config.exclude.includes(repo.name);
    repos.push({ repo, ev: skip ? {} : await gather(repo, config) });
    console.log(`${repo.name}${skip ? ' (skipped)' : ''}`);
  }
  const out = JSON.stringify(build(repos, config), null, 2) + '\n';
  const file = new URL('projects.json', dataDir);
  if (existsSync(file) && readFileSync(file, 'utf8') === out) return console.log('projects.json unchanged');
  writeFileSync(file, out);
  console.log('projects.json written');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((e) => { console.error(`::error::discover-projects failed: ${e.message}`); process.exit(1); });
}
