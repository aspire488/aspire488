import type { CSSProperties } from 'react'
import type { Theme } from '../hooks/useTheme'
import type { GithubController } from '../hooks/useGitHubData'
import { activityFrom, formatDate, languageShare, relativeTime } from '../lib/github'
import { IconRefresh } from './icons'

interface SourcesProps {
  github: GithubController
  theme: Theme
}

export default function Sources({ github, theme }: SourcesProps) {
  const { result, loading, reload } = github
  const data = result?.data
  const repos = data?.repos ?? []
  const profile = data?.profile ?? null
  const share = languageShare(repos)
  const maxCount = share[0]?.count ?? 1
  const activity = data ? activityFrom(data) : []

  const badge =
    result?.source === 'live'
      ? { className: 'is-live', text: `Live · ${relativeTime(result.asOf)}` }
      : result?.source === 'snapshot'
        ? { className: 'is-snapshot', text: `Snapshot · ${formatDate(result.asOf)}` }
        : { className: 'is-down', text: 'Unavailable' }

  return (
    <section className="sources" id="sources" aria-labelledby="sources-title">
      <header className="section-head" data-reveal>
        <h2 className="section-title" id="sources-title">
          Live data
        </h2>
        <p className="prose">
          These figures are read from the GitHub API when this page opens. If a request fails, the
          site falls back to the snapshot GitHub Actions builds into each deployment — the badge
          always says which one you are looking at.
        </p>
      </header>

      <div className="sources__bar" data-reveal>
        <p className={`badge badge--${badge.className}`}>
          <span className="badge__dot" aria-hidden="true" />
          {badge.text}
        </p>

        <button
          type="button"
          className="btn btn--ghost"
          onClick={reload}
          aria-busy={loading}
          disabled={loading}
        >
          <IconRefresh aria-hidden="true" />
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {result?.notice ? (
        <p className="notice" role="status">
          {result.notice} Showing{' '}
          {result.source === 'snapshot'
            ? `the snapshot generated ${formatDate(result.asOf)}.`
            : 'no repository figures for now.'}
        </p>
      ) : null}

      <div className="sources__grid">
        <section className="panel" aria-labelledby="figures-title" data-reveal>
          <h3 className="panel__title" id="figures-title">
            Account
          </h3>

          {result ? (
            <dl className="figures">
              <div>
                <dt className="data-label">Public repositories</dt>
                <dd className="figures__value">{profile?.public_repos ?? repos.length}</dd>
              </div>
              <div>
                <dt className="data-label">Own repositories</dt>
                <dd className="figures__value">{repos.length}</dd>
              </div>
              <div>
                <dt className="data-label">Stars earned</dt>
                <dd className="figures__value">
                  {repos.reduce((total, repo) => total + repo.stargazers_count, 0)}
                </dd>
              </div>
              <div>
                <dt className="data-label">On GitHub since</dt>
                <dd className="figures__value figures__value--sm">
                  {profile ? new Date(profile.created_at).getUTCFullYear() : '—'}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="panel__loading" aria-busy="true">
              Reading repository data…
            </p>
          )}

          {profile ? (
            <a className="link sources__profile" href={profile.html_url} target="_blank" rel="noopener noreferrer">
              github.com/{profile.login}
              <span className="ext" aria-hidden="true">
                ↗
              </span>
              <span className="visually-hidden">(opens in a new tab)</span>
            </a>
          ) : null}
        </section>

        <section className="panel" aria-labelledby="languages-title" data-reveal>
          <h3 className="panel__title" id="languages-title">
            Primary languages across own repositories
          </h3>

          {share.length > 0 ? (
            <ul className="bars">
              {share.slice(0, 7).map((entry) => (
                <li key={entry.name}>
                  <span className="bars__label">{entry.name}</span>
                  <span className="bars__track" aria-hidden="true">
                    <span
                      className="bars__fill"
                      style={{ '--share': `${Math.round((entry.count / maxCount) * 100)}%` } as CSSProperties}
                    />
                  </span>
                  <span className="mono bars__value">
                    {entry.count} {entry.count === 1 ? 'repo' : 'repos'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel__loading" aria-busy="true">
              {loading ? 'Reading languages…' : 'No language data in this snapshot.'}
            </p>
          )}
        </section>

        <section className="panel panel--wide" aria-labelledby="activity-title" data-reveal>
          <h3 className="panel__title" id="activity-title">
            Recent public activity
          </h3>

          {activity.length > 0 ? (
            <ul className="activity">
              {activity.slice(0, 10).map((item) => (
                <li key={item.id}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <span className="activity__text">{item.text}</span>
                    {item.detail ? <span className="activity__detail mono">{item.detail}</span> : null}
                    <span className="activity__time mono">{relativeTime(item.createdAt)}</span>
                    <span className="visually-hidden">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel__loading" aria-busy={loading}>
              {loading
                ? 'Reading activity…'
                : result?.source === 'none'
                  ? 'Activity is unavailable until the API answers — the full history stays on GitHub.'
                  : 'No recent public events.'}
            </p>
          )}
        </section>

        <section className="panel panel--note" aria-labelledby="provenance-title" data-reveal>
          <h3 className="panel__title" id="provenance-title">
            Where these numbers come from
          </h3>
          <p className="prose">
            Live reads use three unauthenticated calls to <code className="mono">api.github.com</code>
            {' — profile, repositories, public events. The build snapshot is regenerated on each deploy by GitHub Actions, so the fallback is never older than one build.'}
            {theme === 'dark' ? ' Nothing is tracked and nothing is stored.' : ' Nothing is tracked.'}
          </p>
        </section>
      </div>
    </section>
  )
}
