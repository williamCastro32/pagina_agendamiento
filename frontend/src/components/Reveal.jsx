import { useEffect, useRef, useState } from 'react'

/**
 * Reveals its children once they scroll into view.
 *
 * IntersectionObserver rather than a scroll handler: the browser does the
 * geometry off the main thread, and we unobserve after the first hit so
 * scrolling back up does not re-animate — replaying on every pass reads as a
 * glitch, not as polish.
 *
 * Respects prefers-reduced-motion by rendering visible from the start; the CSS
 * drops the transition to match.
 */
export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '', ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShown(true)
        observer.unobserve(entry.target)
      },
      // Fires a little before the element reaches the fold, so the motion has
      // finished by the time it is properly in view.
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? 'reveal--in' : ''} ${className}`.trim()}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
