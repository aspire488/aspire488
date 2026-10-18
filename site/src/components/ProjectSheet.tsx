import { useRef, useState, type CSSProperties, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useModal } from '../hooks/useModal'
import type { GithubState } from '../hooks/useGitHubData'
import { PROJECTS, STATUS_LABEL, type Project } from '../content/projects'
import { formatDate, relativeTime } from '../lib/github'
import { asset } from '../lib/asset'
import { IconClose } from './icons'

interface ProjectSheetProps {
  project: Project
  github: GithubState
  backgroundRef: RefObject<HTMLElement | null>
  onClose: () => void
  onNavigate: (slug: string) => void
}

export default function ProjectSheet({
  project,
  github,
  backgroundRef,
  onClose,
  onNavigate,
}: ProjectSheetProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [closing, setClosing] = useState(false)
  const closingRef = useRef(false)

  const requestClose = () => {
    if (closingRef.current) return
    closingRef.current = true
    setClosing(true)
    window.setTimeout(onClose, 200)
  }

  useModal({
    open: true,
    onClose: requestClose,
    containerRef: dialogRef,
    backgroundRef,
    initialFocusRef: dialogRef,
  })

  const result = github.result
  const repos = result?.data.repos ?? []
  const live = repos.find((entry) => entry.full_name === project.repo) ?? null
  const languages = result?.data.languages?.[project.repo] ?? null

  const index = PROJECTS.findIndex((entry) => entry.slug === project.slug)
  const previous = index > 0 ? PROJECTS[index - 1] : null
  const next = index >= 0 && index < PROJECTS.length - 1 ? PROJECTS[index + 1] : null

  const figureNote =
    result?.source === 'live'
      ? `Repository figures fetched live from api.github.com ${relativeTime(result.asOf)}.`
      : result?.source === 'snapshot'
        ? `Repository figures from the build snapshot, generated ${formatDate(result.asOf)}.`
        : 'Repository figures are unavailable right now.'

  return createPortal(
    <div
      className="sheet"
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      tabIndex={-1}
      data-closing={closing || undefined}
    >
      <button type="button" className="sheet__scrim" onClick={requestClose} tabIndex={-1} aria-hidden="true" />

      <div className="sheet__panel">
        <header className="sheet__header">
          <div className="sheet__title-row">
            <div>
              <p className="sheet__repo mono">{project.repo}</p>
              <h2 className="sheet__title" id="sheet-title">
                {project.name}
              </h2>
            </div>
            <button
              type="button"
              className="sheet__close"
              onClick={requestClose}
              aria-label="Close project record"
            >
              <IconClose />
            </button>
          </div>

          <p className="lede sheet__tag">{project.tagline}</p>

          <div className="sheet__badges">
            <span className={`status status--${project.status}`}>
              {STATUS_LABEL[project.status]}
            </span>
            {live ? (
              <span className="mono">
                ★ {live.stargazers_count} · {live.forks_count} forks · pushed{' '}
                {relativeTime(live.pushed_at)}
              </span>
            ) : (
              <span className="mono">{figureNote}</span>
            )}
          </div>
        </header>

        <div className="sheet__body">
          <div className="sheet__main">
            {project.description.map((paragraph) => (
              <p className="prose sheet__prose" key={paragraph.slice(0, 32)}>
                {paragraph}
              </p>
            ))}

            {project.plates.length > 0 ? (
              <div className="sheet__gallery">
                {project.plates.map((plate) => (
                  <figure className="shot" key={plate.src}>
                    <img
                      src={asset(plate.src)}
                      alt={plate.alt}
                      loading="lazy"
                      decoding="async"
                      width={1316}
                      height={765}
                    />
                    <figcaption className="mono">{plate.caption}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="sheet__evidence-full">
                <h3 className="sheet__subhead">Measured evidence</h3>
                <dl className="evidence">
                  {project.evidence.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>
                        <span className="evidence__value">{row.value}</span>
                        {row.note ? <span className="evidence__note mono">{row.note}</span> : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <p className="sheet__note prose">{project.statusNote}</p>
          </div>

          <aside className="sheet__side">
            <section aria-labelledby="sheet-stack">
              <h3 className="sheet__subhead" id="sheet-stack">
                Stack
              </h3>
              <ul className="sheet__stack">
                {project.stack.map((tech) => (
                  <li className="tag mono" key={tech}>
                    {tech}
                  </li>
                ))}
              </ul>

              {languages ? (
                <>
                  <h3 className="sheet__subhead sheet__subhead--spaced">Languages</h3>
                  <ul className="langlist">
                    {Object.entries(languages)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([name, bytes]) => {
                        const total = Object.values(languages).reduce((sum, value) => sum + value, 0)
                        const share = total > 0 ? Math.round((bytes / total) * 100) : 0
                        return (
                          <li key={name}>
                            <span className="langlist__label">{name}</span>
                            <span
                              className="langlist__bar"
                              style={{ '--share': `${share}%` } as CSSProperties}
                              aria-hidden="true"
                            />
                            <span className="mono langlist__value">{share}%</span>
                          </li>
                        )
                      })}
                  </ul>
                </>
              ) : null}
            </section>

            <section aria-labelledby="sheet-links">
              <h3 className="sheet__subhead" id="sheet-links">
                Links
              </h3>
              <ul className="sheet__links">
                {project.links.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.label}
                      <span className="ext" aria-hidden="true">
                        ↗
                      </span>
                      <span className="visually-hidden">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mono sheet__figure-note">{figureNote}</p>
            </section>

            {project.plates.length > 0 ? (
              <section aria-labelledby="sheet-evidence">
                <h3 className="sheet__subhead" id="sheet-evidence">
                  Measured evidence
                </h3>
                <dl className="evidence">
                  {project.evidence.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>
                        <span className="evidence__value">{row.value}</span>
                        {row.note ? <span className="evidence__note mono">{row.note}</span> : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            {project.quote ? (
              <blockquote className="sheet__quote">
                <p>“{project.quote.text}”</p>
                <cite className="mono">{project.quote.source}</cite>
              </blockquote>
            ) : null}
          </aside>
        </div>

        <footer className="sheet__foot">
          <div className="sheet__siblings">
            {previous ? (
              <button type="button" className="sheet__sibling" onClick={() => onNavigate(previous.slug)}>
                <span className="data-label">Previous</span>
                <span className="sheet__sibling-name">{previous.name}</span>
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button
                type="button"
                className="sheet__sibling sheet__sibling--next"
                onClick={() => onNavigate(next.slug)}
              >
                <span className="data-label">Next</span>
                <span className="sheet__sibling-name">{next.name}</span>
              </button>
            ) : (
              <span />
            )}
          </div>
          <button type="button" className="btn sheet__done" onClick={requestClose}>
            Close record
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  )
}
