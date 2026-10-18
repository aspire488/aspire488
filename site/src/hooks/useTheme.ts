import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'edition-theme'

function systemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

export function initialTheme(): Theme {
  return readStoredTheme() ?? systemTheme()
}

/**
 * Theme state written straight to <html data-theme> so the inline
 * background rule in index.html always matches what is on screen.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* private mode — the session still works, it just will not persist */
    }
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }, [])

  return { theme, toggle, setTheme }
}
