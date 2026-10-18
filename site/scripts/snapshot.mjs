#!/usr/bin/env node
/**
 * Build-time GitHub snapshot → public/data/snapshot.json
 *
 * Runs in CI (GITHUB_TOKEN set) before `vite build` so the deployed site has
 * an offline-safe fallback: profile, own repositories, per-repo languages,
 * trimmed public events and refreshed pull-request states.
 *
 * Every value comes from the GitHub API. Failures are reported and the script
 * exits 0 unless REQUIRE_SNAPSHOT=1 — the site falls back to live reads.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE_ROOT = join(HERE, '..')
const OUT_FILE = join(SITE_ROOT, 'public', 'data', 'snapshot.json')

const USERNAME = 'aspire488'
const API = 'https://api.github.com'
const TOKEN = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN ?? ''

/** Fields the site's GhRepo interface reads — nothing else is stored. */
const REPO_FIELDS = [
  'id', 'name', 'full_name', 'description', 'language', 'stargazers_count', 'forks_count',
  'pushed_at', 'created_at', 'homepage', 'html_url', 'archived', 'fork', 'default_branch',
  'topics', 'license',
]

function headers() {
  const base = { Accept: 'application/vnd.github+json', 'User-Agent': 'aspire488-snapshot' }
  return TOKEN ? { ...base, Authorization: `Bearer ${TOKEN}` } : base
}

async function gh(path) {
  const response = await fetch(`${API}${path}`, { headers: headers() })
  if (!response.ok) {
    const error = new Error(`${response.status} ${response.statusText} for ${path}`)
    error.status = response.status
    throw error
  }
  return response.json()
}

function pick(object) {
  const out = {}
  for (const key of REPO_FIELDS) if (key in object) out[key] = object[key]
  return out
}

/** Keep only the fields src/lib/github.ts `describeEvent` reads. */
function trimEvent(event) {
  if (!event?.id || !event?.type) return null
  const payload = event.payload ?? {}
  return {
    id: event.id,
    type: event.type,
    created_at: event.created_at,
    repo: event.repo ? { name: event.repo.name } : undefined,
    payload: {
      action: payload.action,
      ref: payload.ref,
      ref_type: payload.ref_type,
      number: payload.number,
      commits: payload.commits?.map((commit) => ({ message: commit.message })),
      pull_request: payload.pull_request
        ? {
            number: payload.pull_request.number,
            title: payload.pull_request.title,
            merged: payload.pull_request.merged,
          }
        : undefined,
      issue: payload.issue ? { number: payload.issue.number, title: payload.issue.title } : undefined,
      release: payload.release
        ? {
            tag_name: payload.release.tag_name,
            name: payload.release.name,
            html_url: payload.release.html_url,
          }
        : undefined,
    },
  }
}

/** Repository names used by the site, read from the content module. */
async function projectRepos() {
  try {
    const source = await readFile(join(SITE_ROOT, 'src', 'content', 'projects.ts'), 'utf8')
    const found = [...source.matchAll(/repo:\s*'([^']+)'/g)].map((match) => match[1])
    if (found.length > 0) return [...new Set(found)]
  } catch {
    /* fall through to the default below */
  }
  return [`${USERNAME}/campus-bus`, `${USERNAME}/Pipo`]
}

/** Two searches keep us well inside the API's search budget. */
async function pullRequestStates() {
  const queries = [
    { q: `type:pr author:${USERNAME} is:open`, state: 'open' },
    { q: `type:pr author:${USERNAME} is:merged`, state: 'merged' },
  ]
  const seen = new Map()
  for (const query of queries) {
    const data = await gh(
      `/search/issues?q=${encodeURIComponent(query.q)}&per_page=100&sort=updated&order=desc`,
    )
    for (const item of data.items ?? []) {
      const repo = (item.repository_url ?? '').replace(`${API}/repos/`, '')
      if (!repo) continue
      seen.set(`${repo}#${item.number}`, {
        repo,
        number: item.number,
        title: item.title,
        state: query.state,
        url: item.html_url,
        date: query.state === 'merged' ? (item.closed_at ?? null) : null,
      })
    }
  }
  return [...seen.values()]
}

async function main() {
  const warnings = []
  const snapshot = {
    generatedAt: new Date().toISOString(),
    profile: null,
    repos: [],
    languages: {},
    events: [],
    prs: [],
  }

  const requireSnapshot = process.env.REQUIRE_SNAPSHOT === '1'
  const attempt = async (label, run) => {
    try {
      return await run()
    } catch (error) {
      warnings.push(`${label}: ${error.message}`)
      if (requireSnapshot) throw error
      return null
    }
  }

  snapshot.profile = await attempt('profile', () => gh(`/users/${USERNAME}`))

  const allRepos = await attempt('repositories', () =>
    gh(`/users/${USERNAME}/repos?per_page=100&sort=updated`),
  )
  if (Array.isArray(allRepos)) {
    snapshot.repos = allRepos.filter((repo) => !repo.fork).map(pick)
  }

  // Language breakdown only for the repositories the site opens records for.
  const wanted = await projectRepos()
  for (const name of wanted) {
    const languages = await attempt(`languages ${name}`, () => gh(`/repos/${name}/languages`))
    if (languages) snapshot.languages[name] = languages
  }

  const events = await attempt('events', () => gh(`/users/${USERNAME}/events/public?per_page=30`))
  if (Array.isArray(events)) snapshot.events = events.map(trimEvent).filter(Boolean)

  snapshot.prs = await attempt('pull requests', pullRequestStates)

  await mkdir(dirname(OUT_FILE), { recursive: true })
  await writeFile(OUT_FILE, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')

  const counts = {
    repos: snapshot.repos.length,
    languages: Object.keys(snapshot.languages).length,
    events: snapshot.events.length,
    prs: snapshot.prs.length,
  }
  console.log(
    `snapshot written: ${counts.repos} repos, ${counts.languages} language maps, ` +
      `${counts.events} events, ${counts.prs} pull-request states`,
  )
  for (const warning of warnings) console.warn(`warning — ${warning}`)
  if (snapshot.repos.length === 0 && snapshot.prs.length === 0) {
    console.warn('warning — snapshot is empty; the site will rely on live reads')
  }
}

main().catch((error) => {
  console.error(`snapshot failed: ${error.message}`)
  process.exitCode = 1
})
