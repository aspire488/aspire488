import { useCallback, useEffect, useRef, useState } from 'react'
import { loadGitHubData } from '../lib/github'
import type { LoadResult } from '../lib/types'

export interface GithubState {
  result: LoadResult | null
  /** True while the first snapshot or a manual refresh is in flight. */
  loading: boolean
}

/** The hook's return value — state plus a manual refresh trigger. */
export interface GithubController extends GithubState {
  reload: () => void
}

/**
 * Loads the build snapshot first (instant, works offline), then upgrades
 * to live API data. Failures are reported through `result.notice` — the
 * hook never invents numbers.
 */
export function useGitHubData(): GithubController {
  const [state, setState] = useState<GithubState>({ result: null, loading: true })
  const [reloadToken, setReloadToken] = useState(0)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, loading: true }))

    loadGitHubData()
      .then((result) => {
        if (cancelled || !alive.current) return
        setState({ result, loading: false })
      })
      .catch((error: unknown) => {
        if (cancelled || !alive.current) return
        setState({
          result: {
            data: { generatedAt: '', profile: null, repos: [], languages: {}, events: [], prs: [] },
            source: 'none',
            asOf: '',
            notice: error instanceof Error ? error.message : 'Live data is unavailable.',
          },
          loading: false,
        })
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return { ...state, reload }
}
