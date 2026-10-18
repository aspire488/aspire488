import {
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'
import type { GithubState } from '../hooks/useGitHubData'
import {
  CATEGORIES,
  PROJECTS,
  STATUS_LABEL,
  filterProjects,
  stackOptions,
  type CategoryId,
  type Project,
  type ProjectQuery,
} from '../content/projects'
import { relativeTime } from '../lib/github'
import { asset } from '../lib/asset'
import { IconClose, IconGrid, IconList, IconSearch } from './icons'

export type ExplorerView = 'plates' | 'index'

interface WorkProps {
  github: GithubState
  query: ProjectQuery
  onQueryChange: (next: ProjectQuery) => void
  view: ExplorerView
  onViewChange: (view: ExplorerView) => void
  searchRef: RefObject<HTMLInputElement | null>
  onOpenProject: (slug: string) => void
  onClearFilters: () => void
}

/* ---------------------------------------------------------------- *
 * Small pieces
 * ---------------------------------------------------------------- */

function useLiveRepo(github: GithubState, repo: string) {
  const repos = github.result?.data.repos ?? []
  return repos.find((entry) => entry.full_name === repo) ?? null
}

function StatusTag({ project }: { project: Project }) {
  return (
    <span className={`status status--${project.status}`}>{STATUS_LABEL[project.status]}</span>
  )
}

/** The plate every project gets: a real screenshot, or measured evidence. */
function PlateBody({ project }: { project: Project }) {
  const plate = project.plates[0]

  if (plate) {
    return (
      <span className="card__media">
        <img
          src={asset(plate.src)}
          alt={plate.alt}
          loading="lazy"
          decoding="async"
          width={1316}
          height={765}
        />
      </span>
    )
  }

  return (
    <span className="card__media card__media--evidence" aria-hidden="true">
      <span className="evidence-plate">
        {project.evidence.slice(0, 3).map((row) => (
          <span className="evidence-plate__row" key={row.label}>
            <span className="evidence-plate__value">{row.value}</span>
            <span className="evidence-plate__label mono">{row.label}</span>
          </span>
        ))}
      </span>
    </span>
  )
}

/* ---------------------------------------------------------------- *
 * Explorer
 * ---------------------------------------------------------------- */

export default function Work({
  github,
  query,
  onQueryChange,
  view,
  onViewChange,
  searchRef,
  onOpenProject,
  onClearFilters,
}: WorkProps) {
  const previewId = useId()
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewSlug, setPreviewSlug] = useState<string | null>(null)
  const [previewFrom, setPreviewFrom] = useState<'pointer' | 'focus'>('pointer')

  const filtered = useMemo(() => filterProjects(PROJECTS, query), [query])
  const options = useMemo(() => stackOptions(PROJECTS), [])
  const filtersActive = Boolean(query.text?.trim() || query.category || query.stack)

  const previewProject = previewSlug ? PROJECTS.find((p) => p.slug === previewSlug) : undefined

  const setCategory = (category: CategoryId | null) =>
    onQueryChange({ ...query, category: query.category === category ? null : category })

  /* pointer projection (index view only, fine pointers only) */
  const movePreview = (event: ReactPointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== 'mouse') return
    const element = previewRef.current
    if (!element) return
    const x = Math.min(event.clientX + 32, window.innerWidth - 340)
    const y = Math.min(Math.max(event.clientY - 110, 16), window.innerHeight - 300)
    element.style.setProperty('--preview-x', `${x}px`)
    element.style.setProperty('--preview-y', `${y}px`)
  }

  const showPreview = (slug: string, from: 'pointer' | 'focus', rect?: DOMRect) => {
    setPreviewSlug(slug)
    setPreviewFrom(from)
    const element = previewRef.current
    if (!element) return
    if (from === 'focus' && rect) {
      const x = Math.min(rect.right - 360, window.innerWidth - 340)
      const y = Math.min(Math.max(rect.top - 40, 16), window.innerHeight - 300)
      element.style.setProperty('--preview-x', `${Math.max(x, 16)}px`)
      element.style.setProperty('--preview-y', `${y}px`)
    }
  }

  return (
    <section className="work" id="work" aria-labelledby="work-title">
      <header className="section-head" data-reveal>
        <h2 className="section-title" id="work-title">
          Work
        </h2>
        <p className="prose">
          Nine projects across applications, Android, developer tooling, automation and
          infrastructure. Open any record for its stack, evidence, screenshots and links.
        </p>
      </header>

      <div className="explorer">
        <div className="explorer__controls" data-reveal>
          <div className="explorer__search">
            <label className="data-label" htmlFor="project-search">
              Search
            </label>
            <div className="field">
              <span className="field__icon" aria-hidden="true">
                <IconSearch />
              </span>
              <input
                id="project-search"
                ref={searchRef}
                type="search"
                autoComplete="off"
                spellCheck={false}
                placeholder="Try “seat map”, Kotlin, 1495 tests…"
                value={query.text ?? ''}
                onChange={(event) => onQueryChange({ ...query, text: event.target.value })}
                aria-describedby="explorer-count"
              />
              {query.text ? (
                <button
                  type="button"
                  className="field__clear"
                  onClick={() => onQueryChange({ ...query, text: '' })}
                  aria-label="Clear search text"
                >
                  <IconClose />
                </button>
              ) : null}
            </div>
          </div>

          <div className="explorer__cats" role="group" aria-label="Filter by category">
            <button
              type="button"
              className="chip"
              aria-pressed={!query.category}
              onClick={() => onQueryChange({ ...query, category: null })}
            >
              All
            </button>
            {CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                className="chip"
                aria-pressed={query.category === category.id}
                onClick={() => setCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>

          <div className="explorer__tools">
            <div className="explorer__select">
              <label className="data-label" htmlFor="stack-filter">
                Technology
              </label>
              <select
                id="stack-filter"
                value={query.stack ?? ''}
                onChange={(event) =>
                  onQueryChange({ ...query, stack: event.target.value || null })
                }
              >
                <option value="">Any technology</option>
                {options.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
            </div>

            <div className="view-toggle" role="group" aria-label="Project layout">
              <button
                type="button"
                aria-pressed={view === 'plates'}
                onClick={() => onViewChange('plates')}
              >
                <IconGrid aria-hidden="true" />
                Plates
              </button>
              <button
                type="button"
                aria-pressed={view === 'index'}
                onClick={() => onViewChange('index')}
              >
                <IconList aria-hidden="true" />
                Index
              </button>
            </div>
          </div>
        </div>

        <p className="explorer__count" id="explorer-count" aria-live="polite">
          <span>
            {filtered.length} of {PROJECTS.length} projects
            {filtersActive ? ' match these filters' : ''}
          </span>
          {filtersActive ? (
            <button type="button" className="explorer__clear" onClick={onClearFilters}>
              Clear filters
            </button>
          ) : null}
        </p>

        {filtered.length === 0 ? (
          <div className="explorer__empty" role="status">
            <p className="lede">No project matches that.</p>
            <p className="prose">
              Try a technology such as Kotlin, Python or MySQL — or clear the filters and start
              again.
            </p>
            <button type="button" className="btn" onClick={onClearFilters}>
              Clear all filters
            </button>
          </div>
        ) : view === 'plates' ? (
          <ul className="cards">
            {filtered.map((project) => (
              <Card
                key={project.slug}
                project={project}
                github={github}
                onOpen={() => onOpenProject(project.slug)}
              />
            ))}
          </ul>
        ) : (
          <>
            <ul className="rows" onPointerMove={movePreview}>
              {filtered.map((project) => (
                <li key={project.slug}>
                  <button
                    type="button"
                    className="row"
                    aria-haspopup="dialog"
                    onClick={() => onOpenProject(project.slug)}
                    onPointerEnter={(event) => {
                      if (event.pointerType !== 'mouse') return
                      showPreview(project.slug, 'pointer')
                    }}
                    onPointerLeave={() => setPreviewSlug(null)}
                    onFocus={(event) =>
                      showPreview(project.slug, 'focus', event.currentTarget.getBoundingClientRect())
                    }
                    onBlur={() => setPreviewSlug(null)}
                  >
                    <span className="row__name">{project.name}</span>
                    <span className="row__cats">
                      {project.categories
                        .map((id) => CATEGORIES.find((c) => c.id === id)?.label)
                        .join(', ')}
                    </span>
                    <span className="row__stack mono">{project.stack.slice(0, 3).join(' · ')}</span>
                    <span className="row__status">
                      <StatusTag project={project} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div
              className={`preview ${previewProject ? 'is-on' : ''} ${previewFrom === 'focus' ? 'is-focus' : ''}`}
              ref={previewRef}
              id={previewId}
              aria-hidden="true"
            >
              {previewProject ? <PreviewBody project={previewProject} /> : null}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

/* ---------------------------------------------------------------- *
 * Card (plates view)
 * ---------------------------------------------------------------- */

function Card({
  project,
  github,
  onOpen,
}: {
  project: Project
  github: GithubState
  onOpen: () => void
}) {
  const live = useLiveRepo(github, project.repo)
  const plate = project.plates[0]

  return (
    <li className="card" data-reveal={plate ? 'mask' : 'rise'}>
      <article>
        <button type="button" className="card__open" aria-haspopup="dialog" onClick={onOpen}>
          <PlateBody project={project} />
          <span className="card__head">
            <span className="card__name">{project.name}</span>
            <span className="card__tag">{project.tagline}</span>
          </span>
        </button>

        <div className="card__meta">
          <div className="card__chips">
            {project.stack.slice(0, 4).map((tech) => (
              <span key={tech} className="tag mono">
                {tech}
              </span>
            ))}
          </div>
          <div className="card__facts">
            <StatusTag project={project} />
            {live ? (
              <span className="mono card__live">
                ★ {live.stargazers_count} · pushed {relativeTime(live.pushed_at)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="card__links">
          {project.links.map((link) => (
            <a
              key={link.href}
              className="card__link"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
              <span className="ext" aria-hidden="true">
                ↗
              </span>
              <span className="visually-hidden">(opens in a new tab)</span>
            </a>
          ))}
        </div>

        {plate ? (
          <p className="card__caption mono">{plate.caption}</p>
        ) : (
          <p className="card__caption mono">
            {project.evidence.length} measured facts from the repository
          </p>
        )}
      </article>
    </li>
  )
}

/* ---------------------------------------------------------------- *
 * Projection preview (index view)
 * ---------------------------------------------------------------- */

function PreviewBody({ project }: { project: Project }) {
  const plate = project.plates[0]
  if (plate) {
    return (
      <>
        <img src={asset(plate.src)} alt="" loading="lazy" decoding="async" />
        <span className="preview__caption mono">{plate.caption}</span>
      </>
    )
  }
  return (
    <div className="preview__evidence">
      <span className="preview__name">{project.name}</span>
      {project.evidence.slice(0, 3).map((row) => (
        <span className="preview__row" key={row.label}>
          <span className="preview__value">{row.value}</span>
          <span className="mono preview__label">{row.label}</span>
        </span>
      ))}
    </div>
  )
}
