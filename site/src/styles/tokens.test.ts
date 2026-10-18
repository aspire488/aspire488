import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Colour contrast (WCAG 2.1) for the token pairs the site actually renders:
 * body text, secondary text, captions, link text, filled controls and the
 * focus indicator. Values are read from tokens.css so this fails the moment
 * someone nudges a colour into illegibility.
 */

const css = readFileSync(resolve(process.cwd(), 'src', 'styles', 'tokens.css'), 'utf8')

function tokensFor(theme: 'light' | 'dark'): Record<string, string> {
  const block = css.match(new RegExp(`\\[data-theme='${theme}'\\]\\s*\\{([^}]*)\\}`))
  if (!block) throw new Error(`missing [data-theme='${theme}'] block`)
  const found: Record<string, string> = {}
  for (const [, name, value] of block[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)) {
    found[name.replace(/^--/, '')] = value.trim()
  }
  return found
}

function channel(value: number): number {
  const s = value / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  const match = hex.match(/^#([0-9a-f]{6})$/i)
  if (!match) throw new Error(`not a hex colour: ${hex}`)
  const int = parseInt(match[1], 16)
  return (
    0.2126 * channel((int >> 16) & 255) +
    0.7152 * channel((int >> 8) & 255) +
    0.0722 * channel(int & 255)
  )
}

function contrast(a: string, b: string): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (high + 0.05) / (low + 0.05)
}

const PAIRS: { fg: string; bg: string; min: number; what: string }[] = [
  { fg: 'ink', bg: 'paper', min: 7, what: 'body text on paper' },
  { fg: 'ink-2', bg: 'paper', min: 4.5, what: 'secondary text on paper' },
  { fg: 'ink-3', bg: 'paper', min: 4.5, what: 'captions on paper' },
  { fg: 'ink-2', bg: 'surface', min: 4.5, what: 'secondary text on panels' },
  { fg: 'ink-3', bg: 'surface', min: 4.5, what: 'captions on panels' },
  { fg: 'cobalt', bg: 'paper', min: 4.5, what: 'link text on paper' },
  { fg: 'cobalt', bg: 'surface', min: 4.5, what: 'link text on panels' },
  { fg: 'signal-text', bg: 'paper', min: 4.5, what: 'signal text on paper' },
  { fg: 'signal-text', bg: 'surface', min: 4.5, what: 'signal text on panels' },
  { fg: 'paper', bg: 'cobalt', min: 4.5, what: 'text on the cobalt control' },
  { fg: 'paper', bg: 'ink', min: 4.5, what: 'text on the ink control' },
  { fg: 'cobalt', bg: 'paper', min: 3, what: 'focus ring against paper' },
  { fg: 'cobalt', bg: 'surface-2', min: 3, what: 'bars against their track' },
]

describe.each(['light', 'dark'] as const)('token contrast (%s theme)', (theme) => {
  const tokens = tokensFor(theme)

  it.each(PAIRS)('$what is at least $min:1', ({ fg, bg, min }) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(min)
  })
})
