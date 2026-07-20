import { useEffect, useRef, useState } from 'react'

const PHRASE_MS = 4200

/**
 * Drives the hero: which phrase is showing, and whether the reel is running.
 *
 * The phrases are a sequence, not a carousel — they walk the visitor from
 * "someone can guide me" to "I can book this". That is why the markers below
 * are chapter ticks rather than decorative dots, and why the copy lives in
 * content: every buyer rewrites this walk for their own audience.
 */
export function useHeroReel(count) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || count < 2) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), PHRASE_MS)
    return () => clearInterval(id)
  }, [paused, count])

  // A visitor who asked for less motion gets the first phrase, held still.
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) setPaused(true)
  }, [])

  return { index, paused, toggle: () => setPaused((p) => !p), goTo: setIndex }
}

/** The rotating headline. One phrase visible at a time, cross-faded. */
export function HeroPhrases({ phrases, index }) {
  return (
    <h1 className="reel__headline">
      {phrases.map((phrase, i) => (
        <span
          key={phrase}
          className={`reel__phrase ${i === index ? 'reel__phrase--on' : ''}`}
          // Only the visible phrase is announced; the rest are stacked on top
          // of each other and would otherwise all be read out at once.
          aria-hidden={i !== index}
        >
          {phrase}
        </span>
      ))}
    </h1>
  )
}

/**
 * Play/pause plus the chapter ticks, bottom-left and bottom-centre.
 *
 * Pausing is not decoration: the headline moves on its own, and anyone who
 * reads slowly needs a way to stop it.
 */
export function HeroControls({ phrases, index, paused, onToggle, onGoTo, labels }) {
  return (
    <div className="reel__controls">
      <button
        type="button"
        className="reel__toggle"
        onClick={onToggle}
        aria-pressed={paused}
        aria-label={paused ? labels.play : labels.pause}
      >
        <span className={paused ? 'reel__icon-play' : 'reel__icon-pause'} aria-hidden="true" />
      </button>

      <div className="reel__ticks">
        {phrases.map((phrase, i) => (
          <button
            key={phrase}
            type="button"
            className={`reel__tick ${i === index ? 'reel__tick--on' : ''}`}
            onClick={() => onGoTo(i)}
            aria-label={phrase}
            aria-current={i === index}
          >
            <span className="reel__tick-fill" />
          </button>
        ))}
      </div>
    </div>
  )
}

/** Keeps the background video in step with the play/pause control. */
export function useVideoSync(ref, paused) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    // play() rejects when autoplay is blocked; that is expected, not an error.
    if (paused) el.pause()
    else el.play().catch(() => {})
  }, [ref, paused])
}

export const useReelRef = () => useRef(null)
