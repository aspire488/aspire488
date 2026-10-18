import { useMemo, useState } from 'react'
import type { GithubState } from '../hooks/useGitHubData'
import {
  PULL_REQUESTS,
  VERIFIED_ON,
  prKey,
  resolvePullRequests,
  type PrStatus,
} from '../content/openSource'
import { formatDate } from '../lib/github'

const FILTERS: { id: PrStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'merged', label: 'Merged' },
  { id: 'open', label: 'Open' },
  { id: 'closed', label: 'Closed' },
]

const STATE_LABEL: Record<PrStatus, string> = {
  merged: 'Merged',
  open: 'Open',
  closed: 'Closed',
}

export default function Upstream({ github }: { github: GithubState }) {
  const [filter, setFilter] = useState<PrStatus | 'all'>('all')

  const freshMap = useMemo(() => {
    const prs = github.result?.data.prs ?? []
    if (prs.length === 0) return null
    return Object.fromEntries(
      prs.map((entry) => [prKey(entry.repo, entry.number), { status: entry.state, date: entry.date }]),
    )
  }, [github.result])

  const { entries, counts, refreshed } = useMemo(() => resolvePullRequests(freshMap), [freshMap])
  const visible = filter === 'all' ? entries : entries.filter((entry) => entry.status === filter)

  const checkedOn = freshMap ? null : VERIFIED_ON
  const snapshotDate = github.result?.source === 'live' || github.result?.source === 'snapshot'
    ? github.result.asOf
    : ''

  return (
    <section className="upstream" id="upstream" aria-labelledby="upstream-title">
      <header className="section-head" data-reveal>
        <h2 className="section-title" id="upstream-title">
          Upstream
        </h2>
        <p className="prose">
          Pull requests opened in repositories I do not own. Statuses come from{' '}
          <code className="mono">merged_at</code> — a closed pull request is never counted as merged.
        </p>
      </header>

      <div className="upstream__summary" data-reveal>
        <div className="upstream__counts" aria-label="Pull request totals">
          <p>
            <span className="upstream__count">{counts.merged}</span>
            <span className="data-label">merged</span>
          </p>
          <p>
            <span className="upstream__count">{counts.open}</span>
            <span className="data-label">open</span>
          </p>
          <p>
            <span className="upstream__count">{counts.closed}</span>
            <span className="data-label">closed without merge</span>
          </p>
        </div>

        <p className="upstream__checked mono">
          {refreshed
            ? `Statuses re-checked by GitHub Actions · ${formatDate(snapshotDate)}`
            : `Statuses verified against the GitHub API · ${formatDate(checkedOn ?? '')}`}
        </p>
      </div>

      <div className="upstream__filters" role="group" aria-label="Filter pull requests by status" data-reveal>
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            className="chip"
            aria-pressed={filter === option.id}
            onClick={() => setFilter(option.id)}
          >
            {option.label}
            <span className="chip__count mono">
              {option.id === 'all' ? entries.length : counts[option.id as PrStatus]}
            </span>
          </button>
        ))}
      </div>

      <p className="visually-hidden" aria-live="polite">
        Showing {visible.length} of {entries.length} pull requests
      </p>

      <ol className="ledger" data-reveal>
        {visible.map((entry) => (
          <li key={`${entry.repo}#${entry.number}`}>
            <a
              className="ledger__row"
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ledger__state">
                <span className={`pill pill--${entry.status}`}>{STATE_LABEL[entry.status]}</span>
              </span>
              <span className="ledger__repo mono">{entry.repo}</span>
              <span className="ledger__title">{entry.title}</span>
              <span className="ledger__num mono">#{entry.number}</span>
              <span className="ledger__date mono">{formatDate(entry.date)}</span>
              <span className="visually-hidden">(opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ol>

      <p className="upstream__foot prose">
        {PULL_REQUESTS.length} pull requests to {new Set(entries.map((entry) => entry.repo)).size}{' '}
        upstream repositories, plus the full history in{' '}
        <a
          className="link"
          href="https://github.com/aspire488/oss-atlas"
          target="_blank"
          rel="noopener noreferrer"
        >
          OSS Atlas
        </a>
        .
      </p>
    </section>
  )
}
