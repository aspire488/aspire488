import type { CSSProperties } from 'react'
import type { GithubState } from '../hooks/useGitHubData'
import { formatDate, relativeTime } from '../lib/github'
import { asset } from '../lib/asset'
import { IconArrowDown } from './icons'

interface HeroProps {
  github: GithubState
  onExplore: () => void
}

export default function Hero({ github, onExplore }: HeroProps) {
  const result = github.result
  const data = result?.data
  const repos = data?.repos ?? []

  const stars = repos.reduce((total, repo) => total + repo.stargazers_count, 0)
  const lastPush = repos.reduce<string>(
    (latest, repo) => (!latest || repo.pushed_at > latest ? repo.pushed_at : latest),
    '',
  )

  const sourceLine = (() => {
    if (!result) return { dot: 'is-loading', text: 'Reading GitHub data…' }
    if (result.source === 'live') {
      return { dot: 'is-live', text: `Live from api.github.com · ${relativeTime(result.asOf)}` }
    }
    if (result.source === 'snapshot') {
      return {
        dot: 'is-snapshot',
        text: `Build snapshot · generated ${formatDate(result.asOf)} by GitHub Actions`,
      }
    }
    return { dot: 'is-down', text: 'GitHub data unavailable' }
  })()

  return (
    <section className="hero" id="front" aria-labelledby="hero-title">
      <div className="hero__type">
        <h1 className="display hero__title" id="hero-title">
          <span className="line-mask">
            <span>Joel</span>
          </span>
          <span className="line-mask" style={{ '--reveal-delay': '110ms' } as CSSProperties}>
            <span>Jigo</span>
          </span>
        </h1>
        <span className="hero__rule" data-reveal aria-hidden="true" />
      </div>

      <div className="hero__grid">
        <div className="hero__intro" data-reveal>
          <p className="lede">
            Computer Science Engineering student building desktop and Android applications,
            developer tooling, automation and AI infrastructure.
          </p>
          <p className="prose hero__intro-note">
            I contribute upstream fixes with regression coverage, and prefer explicit boundaries,
            reproducible checks and evidence over claims.
          </p>
          <button type="button" className="hero__cta" onClick={onExplore}>
            Explore the work
            <IconArrowDown />
          </button>
        </div>

        <aside className="hero__live" data-reveal aria-label="GitHub figures">
          <p className={`hero__source mono is-revealed`}>
            <span className={`hero__dot ${sourceLine.dot}`} aria-hidden="true" />
            <span>{sourceLine.text}</span>
          </p>

          <dl className="hero__stats" aria-busy={github.loading && !result}>
            <div>
              <dt className="data-label">Own repositories</dt>
              <dd className="hero__figure">
                {result ? repos.length : '—'}
              </dd>
            </div>
            <div>
              <dt className="data-label">Stars earned</dt>
              <dd className="hero__figure">{result ? stars : '—'}</dd>
            </div>
            <div>
              <dt className="data-label">Last push</dt>
              <dd className="hero__figure hero__figure--sm">
                {result && lastPush ? relativeTime(lastPush) : '—'}
              </dd>
            </div>
          </dl>

          {result?.notice ? <p className="hero__notice">{result.notice}</p> : null}
        </aside>
      </div>

      <figure className="hero__band" data-reveal="mask">
        <img
          src={asset('media/cb-seat-map.png')}
          alt="Campus Bus seat selection screen: a route timeline across stops above a grid of numbered bus seats, with the chosen seat shown on the right"
          width={1316}
          height={765}
          loading="eager"
          decoding="async"
        />
        <figcaption className="mono">
          Campus Bus — route timeline and seat selection, from the running application.
        </figcaption>
      </figure>
    </section>
  )
}
