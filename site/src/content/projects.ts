/**
 * Curated project index.
 *
 * Everything here was verified against the repositories on 18 October 2026
 * (README, tree, releases, screenshots). Numbers that change — stars, forks,
 * last push — are never hard-coded: they come from the live API or the
 * build snapshot at runtime.
 */

export type CategoryId =
  | 'applications'
  | 'android'
  | 'tools'
  | 'automation'
  | 'infrastructure'
  | 'open-source'
  | 'learning'

export interface Category {
  id: CategoryId
  label: string
}

export const CATEGORIES: Category[] = [
  { id: 'applications', label: 'Applications' },
  { id: 'tools', label: 'Developer tools' },
  { id: 'automation', label: 'Automation' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'android', label: 'Android' },
  { id: 'open-source', label: 'Open source' },
  { id: 'learning', label: 'Learning' },
]

export type ProjectStatus = 'active' | 'paused' | 'frozen'

export const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  frozen: 'Frozen prototype',
}

export interface Plate {
  /** Path relative to public/ */
  src: string
  /** Screenshots use `screenshot`, generated dashboards use `figure`. */
  kind: 'screenshot' | 'figure'
  alt: string
  caption: string
}

export interface Link {
  label: string
  href: string
  kind: 'repo' | 'demo' | 'release' | 'docs'
}

export interface EvidenceRow {
  label: string
  value: string
  /** Optional qualifier so measurements keep their units and context. */
  note?: string
}

export interface Project {
  slug: string
  name: string
  /** "owner/name" — used for every link and for live stats lookup. */
  repo: string
  tagline: string
  /** What this project is, in the repository's own framing. */
  description: string[]
  categories: CategoryId[]
  stack: string[]
  status: ProjectStatus
  statusNote: string
  /** Measured, quoted or released facts — shown as an evidence plate. */
  evidence: EvidenceRow[]
  /** Quotes taken verbatim from the repository. */
  quote?: { text: string; source: string }
  plates: Plate[]
  links: Link[]
  /** Sort key for the default order (highest first). */
  rank: number
}

export const PROJECTS: Project[] = [
  {
    slug: 'campus-bus',
    name: 'Campus Bus',
    repo: 'aspire488/campus-bus',
    tagline: 'Bus seat reservation for campuses: find a route, take a seat, carry a pass.',
    description: [
      'A desktop reservation system for student transport. Students search a bus by stop and trip, pick a seat from a live seat map, and receive a PDF campus pass. The transport office runs buses, routes, timetables, students, reservations and admin accounts from the same tool.',
      'The Swing interface renders HTML5/CSS/JS views inside a JavaFX WebView over JDBC and MySQL 8. Releases ship as a self-contained Windows package.',
    ],
    categories: ['applications'],
    stack: ['Java', 'Swing', 'JavaFX', 'JDBC', 'MySQL', 'Maven'],
    status: 'active',
    statusNote:
      'Ships as a Windows zip with a bundled Java 25 runtime. No open-source licence file is declared yet.',
    evidence: [
      { label: 'Windows package', value: 'v1.1', note: 'released 18 Oct 2026' },
      { label: 'Bundled runtime', value: 'Java 25', note: 'Eclipse Temurin via jlink — no Java or Maven install' },
      { label: 'Database install', value: 'private, per user', note: 'MySQL 8.4.11 on port 3310, no admin rights' },
      { label: 'Measured setup', value: '101 seconds', note: 'end to end, on the developer’s machine' },
      { label: 'Demo dataset', value: '5 routes · 13 buses · 150 students', note: 'synthetic — Demo College of Engineering' },
    ],
    quote: {
      text: 'It never prints a password. Running it again changes nothing.',
      source: 'aspire488/campus-bus README',
    },
    plates: [
      {
        src: 'media/cb-seat-map.png',
        kind: 'screenshot',
        alt: 'Campus Bus seat selection screen showing a bus seat map with free and booked seats and a stop picker',
        caption: 'Seat map — green seats are free, red are taken; the picker sets trip and stop.',
      },
      {
        src: 'media/cb-student-home.png',
        kind: 'screenshot',
        alt: 'Campus Bus student dashboard with bus search and upcoming trips',
        caption: 'Student home — the first screen after sign-in.',
      },
      {
        src: 'media/cb-admin-overview.png',
        kind: 'screenshot',
        alt: 'Campus Bus transport office administration overview',
        caption: 'Transport office — routes, buses and reservations in one console.',
      },
      {
        src: 'media/cb-campus-pass.png',
        kind: 'screenshot',
        alt: 'Campus Bus PDF campus pass issued to a student',
        caption: 'The campus pass the student leaves with, generated as a PDF.',
      },
      {
        src: 'media/cb-find-a-bus.png',
        kind: 'screenshot',
        alt: 'Campus Bus bus search screen',
        caption: 'Earlier build of “find a bus” — the shipped version also asks for trip and stop.',
      },
      {
        src: 'media/cb-login.png',
        kind: 'screenshot',
        alt: 'Campus Bus login screen',
        caption: 'Sign-in. Demo accounts are documented in the README.',
      },
    ],
    links: [
      { label: 'Repository', href: 'https://github.com/aspire488/campus-bus', kind: 'repo' },
      { label: 'Windows release v1.1', href: 'https://github.com/aspire488/campus-bus/releases/tag/v1.1', kind: 'release' },
      { label: 'All releases', href: 'https://github.com/aspire488/campus-bus/releases', kind: 'release' },
    ],
    rank: 100,
  },

  {
    slug: 'pipo',
    name: 'Pipo',
    repo: 'aspire488/Pipo',
    tagline: 'A robot who lives in your phone — routines, memory, and a 3D room on the web.',
    description: [
      'A character-first Android simulation: a small robot with moods, memories, habits, projects and opinions. An autonomous activity engine replays the time you missed whenever the app reopens, and a relationship stat grows with shared time.',
      'The repository also hosts a Three.js room on GitHub Pages with a day/night cycle, an autonomous Pipo and his pet robot Nib, plus a classic 2D demo. Optional online features — voice, chat, weather — are switchable.',
    ],
    categories: ['android', 'applications'],
    stack: ['Kotlin', 'Android', 'Three.js', 'JavaScript', 'Gradle'],
    status: 'active',
    statusNote:
      'Signed APK for Android 8.0+ (API 26). Device-validated on a Galaxy S23. No account, no analytics.',
    evidence: [
      { label: 'Android release', value: 'v1.0', note: 'APK, 4 Oct 2026 — Android 8.0 and up' },
      { label: 'Test suite', value: '175 tests', note: 'per the repository badge' },
      { label: 'Live 3D world', value: 'GitHub Pages', note: 'day/night cycle, tap-to-call, “where is Pipo?”' },
      { label: 'Accounts', value: 'none', note: 'local JSON storage only' },
    ],
    quote: {
      text: 'I wonder what Pipo is doing. … there is a note on the door: he went to the hardware shop because the flying machine needs a motor.',
      source: 'aspire488/Pipo README',
    },
    plates: [
      {
        src: 'media/pipo-world-live.jpg',
        kind: 'screenshot',
        alt: 'Pipo’s 3D room rendered in the browser: bed, desk, workbench, string lights and the robot standing on a rug',
        caption: 'The live 3D room, captured from aspire488.github.io/Pipo while it was running.',
      },
      {
        src: 'media/pipo-device.jpg',
        kind: 'screenshot',
        alt: 'Pipo running on a Galaxy S23 phone',
        caption: 'On-device capture, Galaxy S23.',
      },
    ],
    links: [
      { label: 'Repository', href: 'https://github.com/aspire488/Pipo', kind: 'repo' },
      { label: 'Live 3D world', href: 'https://aspire488.github.io/Pipo/', kind: 'demo' },
      { label: 'Classic demo', href: 'https://aspire488.github.io/Pipo/classic/', kind: 'demo' },
      { label: 'APK release v1.0', href: 'https://github.com/aspire488/Pipo/releases/tag/v1.0', kind: 'release' },
    ],
    rank: 96,
  },

  {
    slug: 'universal-engineering-augmentation',
    name: 'Universal Engineering Augmentation',
    repo: 'aspire488/Universal-Engineering-Augmentation',
    tagline: 'Deterministic code intelligence and verification for coding agents.',
    description: [
      'A tool-agnostic layer that moves repeatable engineering work out of probabilistic model reasoning and into systems that establish it faster: tree-sitter structural analysis, import graphs and blast-radius impact analysis, tiered verification runs, property and mutation testing, Z3 checks, and isolated git worktree candidates.',
      'Specialists route deterministically — a keyword classifier first, with an optional local model consulted only when classification is unknown, fail-soft and switchable off.',
    ],
    categories: ['tools', 'automation'],
    stack: ['Python', 'tree-sitter', 'Z3', 'Hypothesis', 'DuckDB', 'SQLite'],
    status: 'active',
    statusNote: 'Public alpha, v0.1.0. Verified on CI for Python 3.10–3.12. MIT licensed.',
    evidence: [
      { label: 'Tree-sitter parse', value: '176 ms', note: '10 files' },
      { label: 'Impact analysis', value: '24 ms', note: 'blast radius' },
      { label: 'Event log write', value: '16 ms', note: 'SQLite' },
      { label: 'Property test', value: '253 ms', note: 'Hypothesis run' },
      { label: 'DuckDB query', value: '77 ms', note: 'analytics over the event log' },
      { label: 'Candidate proposal', value: '1.1 s', note: '2 worktree candidates' },
    ],
    quote: {
      text: 'Coding agents are strongest when they reason about novel problems. A poor place to repeatedly re-derive facts that deterministic tools can establish faster and more reliably.',
      source: 'aspire488/Universal-Engineering-Augmentation README',
    },
    plates: [],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/aspire488/Universal-Engineering-Augmentation',
        kind: 'repo',
      },
    ],
    rank: 92,
  },

  {
    slug: 'kio',
    name: 'KIO',
    repo: 'aspire488/Kio',
    tagline: 'A personal AI companion runtime with typed tools and a written constitution.',
    description: [
      'The application layer and working monorepo behind KIO: backend, browser connector, desktop, execution, intelligence, llm, memory, media, observers and platform modules, with adapters for agency frameworks and a Telegram entry point.',
      'Alongside the code sit roughly seventy governance documents — gates, audits, snapshots of validation runs — including an identity canon that binds what the system may say about itself.',
    ],
    categories: ['infrastructure', 'automation'],
    stack: ['Python', 'FastAPI', 'Retrieval', 'Telegram', 'pytest'],
    status: 'paused',
    statusNote:
      'No public README yet — the repository is documentation-heavy by design. Last commit 12 Aug 2026; ~245 tests pass with 6 failing per the last gate summary.',
    evidence: [
      { label: 'Codebase', value: '4.35 MB Python', note: 'largest project in the account' },
      { label: 'Governance docs', value: '~70', note: 'constitution, canon, gates, audits, snapshots' },
      { label: 'Test gate', value: '245 pass / 6 fail', note: 'ANCHORED_SUMMARY.md, gate C-4' },
      { label: 'Entry points', value: 'desktop · browser · Telegram', note: 'one runtime, several surfaces' },
    ],
    quote: {
      text: 'INV.001: KIO never lies about itself. INV.002: KIO never presents a ROADMAP fact as CURRENT.',
      source: 'aspire488/Kio · KIO_IDENTITY_CANON.md',
    },
    plates: [],
    links: [{ label: 'Repository', href: 'https://github.com/aspire488/Kio', kind: 'repo' }],
    rank: 88,
  },

  {
    slug: 'gh-ops',
    name: 'gh-ops',
    repo: 'aspire488/gh-ops',
    tagline: 'GitHub operations on Actions: monitoring, OSS radar, security, quiet briefs.',
    description: [
      'A personal GitHub operations layer that runs its jobs inside GitHub Actions — repository monitoring, open-source opportunity hunting, developer and security intelligence, and Telegram notification contracts with dedupe, all dispatched through one entry point used identically in CI and on a laptop.',
      'Repository scope is configuration, never inference: the watched list comes from a YAML file and is never expanded automatically.',
    ],
    categories: ['automation', 'tools'],
    stack: ['Python', 'GitHub Actions', 'Telegram', 'DuckDB'],
    status: 'frozen',
    statusNote: 'Complete and frozen — maintenance mode, secrets via environment only.',
    evidence: [
      { label: 'Test suite', value: '1,495 / 1,495', note: 'passing, at freeze' },
      { label: 'Jobs', value: 'daily · monitoring · weekly-report', note: 'oss-hunt · security · status' },
      { label: 'Test packages', value: '14', note: 'under tests/' },
      { label: 'Scope control', value: 'config/repositories.yml', note: 'account repos are never added automatically' },
    ],
    quote: {
      text: 'Repository counts come only from config/repositories.yml; accessible account repositories are never added automatically.',
      source: 'aspire488/gh-ops ARCHITECTURE.md',
    },
    plates: [],
    links: [{ label: 'Repository', href: 'https://github.com/aspire488/gh-ops', kind: 'repo' }],
    rank: 84,
  },

  {
    slug: 'aura',
    name: 'AURA',
    repo: 'aspire488/AURA',
    tagline: 'An event-driven cognitive runtime: memory, reasoning, planning, orchestration.',
    description: [
      'The infrastructure layer under KIO — explicitly not a chatbot and not an agent framework in the prompt-chaining sense. Observation, identity, episodic/semantic/working memory with vector and graph retrieval, world model, probabilistic beliefs with per-claim confidence, hierarchical goals, structured reasoning traces and a confidence-gated decision layer.',
      'Provider-agnostic over OpenAI, Gemini, Groq and OpenRouter; persistence on PostgreSQL, Redis, Neo4j and ChromaDB behind FastAPI.',
    ],
    categories: ['infrastructure'],
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'Neo4j', 'ChromaDB'],
    status: 'paused',
    statusNote:
      'Parked on the integration-validation branch since 28 Jun 2026. README badges claim MIT; no LICENSE file was confirmed in the tree.',
    evidence: [
      { label: 'Subsystems', value: '17', note: 'all marked implemented in the README table' },
      { label: 'Storage', value: 'PostgreSQL · Redis · Neo4j · ChromaDB', note: 'persistence layer' },
      { label: 'Providers', value: 'OpenAI · Gemini · Groq · OpenRouter', note: 'no vendor lock' },
      { label: 'Branch', value: 'integration-validation', note: 'not main — the repo froze mid-life' },
    ],
    quote: {
      text: 'AURA ≠ Chatbot · AURA ≠ LLM wrapper · AURA = cognitive operating system for persistent agents.',
      source: 'aspire488/AURA README',
    },
    plates: [],
    links: [
      {
        label: 'Repository',
        href: 'https://github.com/aspire488/AURA',
        kind: 'repo',
      },
    ],
    rank: 80,
  },

  {
    slug: 'oss-atlas',
    name: 'OSS Atlas',
    repo: 'aspire488/oss-atlas',
    tagline: 'A living ledger of upstream work, regenerated every day by Actions.',
    description: [
      'Every external contribution is recorded as evidence rather than a claim: the pull request, the date, the outcome. The ledger backs a machine-readable contributions file, case studies, research notes and skills mapped to proof.',
      'A daily workflow regenerates SVG dashboard cards from the data and commits them, so the dashboard cannot drift from the truth it summarises.',
    ],
    categories: ['open-source', 'automation'],
    stack: ['Python', 'GitHub Actions', 'SVG', 'JSON'],
    status: 'active',
    statusNote: 'MIT licensed. Dashboard regenerated by GitHub Actions on a daily schedule.',
    evidence: [
      { label: 'Ledger entries', value: '46', note: 'in data/contributions.json' },
      { label: 'Refresh', value: 'daily', note: 'auto-commit from Actions' },
      { label: 'Workflows', value: 'ci · atlas-audit · dashboard', note: 'three in the repository' },
      { label: 'Record', value: 'Observed → Implemented → Verified → Documented', note: 'the ledger’s own rule' },
    ],
    plates: [
      {
        src: 'media/oss-atlas-overview.svg',
        kind: 'figure',
        alt: 'OSS Atlas generated dashboard card summarising contributions by status and repository',
        caption: 'A dashboard card generated by the repository’s own pipeline — regenerated daily.',
      },
    ],
    links: [
      { label: 'Repository', href: 'https://github.com/aspire488/oss-atlas', kind: 'repo' },
      {
        label: 'Pull requests by aspire488',
        href: 'https://github.com/pulls?q=is%3Apr+author%3Aaspire488',
        kind: 'docs',
      },
    ],
    rank: 78,
  },

  {
    slug: 'codeflow',
    name: 'CodeFlow',
    repo: 'aspire488/codeflow',
    tagline: 'Programming lessons that show execution instead of describing it.',
    description: [
      'An execution-first learning prototype: program state, output, control flow and visual feedback are presented as learning primitives rather than static source text, with quizzes, output-prediction and logic games around them. Any AI chat sits outside the deterministic execution path.',
      'The deployment is experimental and the repository says plainly that the work is finished.',
    ],
    categories: ['learning'],
    stack: ['JavaScript', 'Vite', 'Node', 'CodeQL'],
    status: 'frozen',
    statusNote: 'Completed prototype — the README states new product development is out of scope. MIT.',
    evidence: [
      { label: 'Status', value: 'frozen', note: 'per the repository README' },
      { label: 'Scope', value: 'C · HTML · CSS · JavaScript', note: 'step-by-step execution lessons' },
      { label: 'Checks', value: 'CodeQL · Dependabot', note: 'CI on the repository' },
      { label: 'Deployment', value: 'experimental', note: 'not a general-purpose runtime' },
    ],
    quote: {
      text: 'CodeFlow is now treated as a completed/frozen prototype … new product development is intentionally out of scope.',
      source: 'aspire488/codeflow README',
    },
    plates: [
      {
        src: 'media/codeflow-architecture.svg',
        kind: 'figure',
        alt: 'CodeFlow architecture diagram',
        caption: 'Architecture diagram from the repository.',
      },
    ],
    links: [
      { label: 'Repository', href: 'https://github.com/aspire488/codeflow', kind: 'repo' },
      { label: 'Live demo', href: 'https://codeflow-app-sigma.vercel.app', kind: 'demo' },
    ],
    rank: 40,
  },

  {
    slug: 'medimind',
    name: 'MediMind',
    repo: 'aspire488/medimind',
    tagline: 'Medication reminders with three roles and a hard synthetic-data boundary.',
    description: [
      'A health-workflow prototype with Senior, Patient and Caregiver modes, a deterministic reminder layer and an optional, deliberately bounded assistant. Role, safety boundary and data rules are part of the design, not documentation added afterwards.',
      'React 18 with a Playwright end-to-end suite in CI; mobile-first — the web build asks for a phone-sized window.',
    ],
    categories: ['applications'],
    stack: ['React', 'Vite', 'Playwright', 'CodeQL'],
    status: 'frozen',
    statusNote: 'Prototype, frozen. MIT. Explicitly not a medical device; synthetic data only.',
    evidence: [
      { label: 'Roles', value: 'Senior · Patient · Caregiver', note: 'three modes in one app' },
      { label: 'E2E suite', value: 'Playwright', note: 'Chromium smoke run in CI' },
      { label: 'Boundary', value: 'synthetic data only', note: 'enforced in the design' },
      { label: 'Viewport', value: 'under 768 px', note: 'the build refuses desktop widths' },
    ],
    quote: {
      text: 'MediMind is not a medical device and is not clinical software. … These constraints are part of the engineering design, not optional documentation.',
      source: 'aspire488/medimind README',
    },
    plates: [
      {
        src: 'media/medimind-live.jpg',
        kind: 'screenshot',
        alt: 'MediMind mobile PIN screen with demo accounts listed below the keypad',
        caption: 'Captured from the live deployment at phone width.',
      },
      {
        src: 'media/medimind-architecture.svg',
        kind: 'figure',
        alt: 'MediMind architecture diagram',
        caption: 'Architecture diagram from the repository.',
      },
    ],
    links: [
      { label: 'Repository', href: 'https://github.com/aspire488/medimind', kind: 'repo' },
      { label: 'Live demo', href: 'https://medimind-seven.vercel.app/', kind: 'demo' },
    ],
    rank: 38,
  },
]

/* ---------------------------------------------------------------- *
 * Filtering — pure so it can be unit-tested and reused by the
 * command palette.
 * ---------------------------------------------------------------- */

export interface ProjectQuery {
  text?: string
  category?: CategoryId | null
  stack?: string | null
}

export function filterProjects(projects: Project[], query: ProjectQuery): Project[] {
  const text = query.text?.trim().toLowerCase() ?? ''
  const category = query.category ?? null
  const stack = query.stack ?? null

  return projects.filter((project) => {
    if (category && !project.categories.includes(category)) return false
    if (stack && !project.stack.some((tech) => tech.toLowerCase() === stack.toLowerCase())) {
      return false
    }
    if (!text) return true

    // Commas in counts ("1,495") must not block a typed "1495".
    const haystack = [
      project.name,
      project.tagline,
      project.repo,
      project.statusNote,
      ...project.stack,
      ...project.categories.map((id) => CATEGORIES.find((c) => c.id === id)?.label ?? id),
      ...project.description,
      ...project.evidence.map((row) => `${row.label} ${row.value} ${row.note ?? ''}`),
    ]
      .join(' ')
      .toLowerCase()
      .replace(/,/g, '')

    return text
      .replace(/,/g, '')
      .split(/\s+/)
      .every((term) => haystack.includes(term))
  })
}

/** Every distinct technology across projects, for the stack filter. */
export function stackOptions(projects: Project[]): string[] {
  const set = new Set<string>()
  for (const project of projects) for (const tech of project.stack) set.add(tech)
  return [...set].sort((a, b) => a.localeCompare(b))
}

export function findProject(slug: string): Project | undefined {
  return PROJECTS.find((project) => project.slug === slug)
}
