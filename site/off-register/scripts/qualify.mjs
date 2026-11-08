// Pure rules that decide what a repo is and how far along it is. No I/O, so tests can feed it plain objects.
//
// evidence = { readmeLength, languages: {name: bytes}, humanCommits, releases: [{tag, date, prerelease, assets}],
//              tags: [name], testFiles, workflows, ciConclusion, manifests: [path], pkg, liveUrl }
// A Pages URL counts as liveUrl only after discovery has checked that it answers.

const APP_LANGS = ['Kotlin', 'Java', 'Swift', 'C#'];
const SEMVER = /^v?\d+\.\d+\.\d+/;

const sourceBytes = (ev) => Object.values(ev.languages ?? {}).reduce((a, b) => a + b, 0);
const has = (ev, re) => (ev.manifests ?? []).some((m) => re.test(m));

export function classify(repo, ev) {
  const top = Object.entries(ev.languages ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0];
  const deps = { ...ev.pkg?.dependencies, ...ev.pkg?.devDependencies };
  // a Kotlin app with a web demo is still an app, so the language check comes before the live URL check
  if (APP_LANGS.includes(top)) return 'app';
  if (ev.liveUrl || has(ev, /(^|\/)index\.html$/) || deps.vite || deps.next) return 'web';
  if (has(ev, /(^|\/)(build\.gradle(\.kts)?|pom\.xml)$/)) return 'app';
  if (has(ev, /(^|\/)(pyproject\.toml|setup\.py)$/) || ev.pkg?.main || ev.pkg?.exports) return 'library';
  return 'other';
}

function shipping(type, ev) {
  const releases = ev.releases ?? [];
  switch (type) {
    case 'web': return !!ev.liveUrl;
    case 'app': return releases.some((r) => !r.prerelease && r.assets >= 1);
    case 'library': return releases.length > 0 || (ev.tags ?? []).some((t) => SEMVER.test(t));
    default: return releases.length > 0 || !!ev.liveUrl;
  }
}

function describe(ev) {
  const out = [];
  const r = (ev.releases ?? []).find((x) => !x.prerelease) ?? ev.releases?.[0];
  if (r) out.push(`release ${r.tag} (${r.date})`);
  if (ev.liveUrl) out.push(`live: ${ev.liveUrl}`);
  if (ev.testFiles) out.push(`tests: ${ev.testFiles} files`);
  if (ev.workflows && ev.ciConclusion) out.push(`CI: ${ev.ciConclusion === 'success' ? 'passing' : ev.ciConclusion}`);
  if (ev.readmeLength) out.push(`README ${(ev.readmeLength / 1000).toFixed(1)} kB`);
  if (ev.humanCommits != null) out.push(`commits: ${ev.humanCommits}`);
  return out;
}

export function qualify(repo, ev, config = {}) {
  const type = classify(repo, ev);
  const evidence = describe(ev);
  const done = (state) => ({ state, type, evidence });
  if (config.exclude?.includes(repo.name)) return done('excluded');
  if (repo.fork) return done('fork');
  if (config.archive?.includes(repo.name) || repo.archived) return done('archived');
  if (config.featured?.includes(repo.name)) return done('featured');
  const identity = !!repo.description?.trim() && (ev.readmeLength ?? 0) >= 600;
  const implementation = sourceBytes(ev) >= 20000 && (ev.humanCommits ?? 0) >= 10;
  if (identity && implementation) return done(shipping(type, ev) ? 'shipped' : 'developing');
  return done('discovered');
}
