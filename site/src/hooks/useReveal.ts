import { useEffect, useLayoutEffect } from 'react'

const REVEAL_SELECTOR = '[data-reveal], .line-mask'

/**
 * One reveal system for the whole page: anything marked is observed once,
 * revealed when it enters the viewport, then unobserved.
 *
 * Called after each render wave so sections rendered later (filtered
 * results, live data) are picked up too. Nodes already revealed are
 * skipped, so repeated calls are cheap.
 */
export function useReveal(dependencies: unknown[] = []) {
  useLayoutEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)).filter(
      (node) => !node.classList.contains('is-revealed'),
    )
    if (nodes.length === 0) return

    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach((node) => node.classList.add('is-revealed'))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)
}

/**
 * Safety net: if anything is still hidden after four seconds (observer
 * never fired, element measured as zero-size) reveal it rather than
 * leaving content invisible.
 */
export function useRevealFailsafe() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed), .line-mask:not(.is-revealed)')
        .forEach((node) => node.classList.add('is-revealed'))
    }, 4000)
    return () => window.clearTimeout(timer)
  }, [])
}
