import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

export function focusableWithin(container: HTMLElement | null): HTMLElement[] {
  if (!container) return []
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      element.getAttribute('aria-hidden') !== 'true' &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element === document.activeElement),
  )
}

function setInert(element: HTMLElement, value: boolean) {
  // Attribute form works in every supporting browser and is inspectable in tests.
  if (value) element.setAttribute('inert', '')
  else element.removeAttribute('inert')
}

interface ModalOptions {
  open: boolean
  onClose: () => void
  containerRef: RefObject<HTMLElement | null>
  /** Everything that must not be reachable while the modal is open. */
  backgroundRef?: RefObject<HTMLElement | null>
  /** Element focused when the modal opens (falls back to [data-autofocus]). */
  initialFocusRef?: RefObject<HTMLElement | null>
  /** Set false for dialogs that should not lock page scroll. */
  lockScroll?: boolean
}

/**
 * Shared dialog behaviour: focus entry, Tab trap, Escape to close,
 * focus restoration, background inert, scroll lock.
 */
export function useModal({
  open,
  onClose,
  containerRef,
  backgroundRef,
  initialFocusRef,
  lockScroll = true,
}: ModalOptions) {
  // Keep the latest close handler in a ref so the trap effect does not
  // tear down (and restore focus) every time the caller re-renders.
  const onCloseRef = useRef(onClose)
  useLayoutEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const container = containerRef.current
    const background = backgroundRef?.current ?? null
    const restoreTo = (document.activeElement as HTMLElement | null) ?? null
    const previousOverflow = document.body.style.overflow

    if (background) setInert(background, true)
    if (lockScroll) document.body.style.overflow = 'hidden'

    // Move focus in once the dialog has painted.
    const raf = requestAnimationFrame(() => {
      const explicit = initialFocusRef?.current
      const fallback =
        container?.querySelector<HTMLElement>('[data-autofocus]') ?? focusableWithin(container)[0]
      const target = explicit ?? fallback ?? container ?? null
      target?.focus?.()
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab' || !container) return

      const focusables = focusableWithin(container)
      if (focusables.length === 0) {
        event.preventDefault()
        container.focus?.()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      const inside = active ? container.contains(active) : false

      if (!inside) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKeyDown, true)
      if (background) setInert(background, false)
      if (lockScroll) document.body.style.overflow = previousOverflow
      // Return focus to whatever opened the dialog, if it still exists.
      if (restoreTo && document.contains(restoreTo)) restoreTo.focus()
    }
  }, [open, containerRef, backgroundRef, initialFocusRef, lockScroll])
}
