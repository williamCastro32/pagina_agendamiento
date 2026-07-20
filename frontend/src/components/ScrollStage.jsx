import { useEffect, useRef, useState } from 'react'
import Mesh, { HERO_MESH } from './Mesh'

/**
 * The fixed backdrop the page scrolls over.
 *
 * `position: fixed` rather than a background on the hero: the media has to keep
 * playing behind the sections that follow, not scroll away with the first fold.
 * Sections after the hero carry opaque backgrounds and simply cover it.
 *
 * Falls back to the animated mesh when no video is configured. That is the
 * common case, not an edge case — videoUrl ships empty and many buyers never
 * set one, so the fallback has to look deliberate rather than broken.
 */
export default function ScrollStage({ videoUrl }) {
  const [progress, setProgress] = useState(0)
  const frame = useRef(0)

  useEffect(() => {
    // Scroll fires far more often than we can paint; coalesce into one rAF.
    const onScroll = () => {
      if (frame.current) return
      frame.current = requestAnimationFrame(() => {
        frame.current = 0
        const travel = window.innerHeight || 1
        setProgress(Math.min(1, window.scrollY / travel))
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [])

  return (
    <div className="stage" aria-hidden="true">
      <div
        className="stage__media"
        // Drifts up and dims as the hero leaves: the parallax reads as depth
        // and keeps the copy legible once sections start passing over.
        style={{
          transform: `translate3d(0, ${progress * -8}%, 0) scale(${1 + progress * 0.08})`,
        }}
      >
        {videoUrl ? (
          <video
            className="stage__video"
            src={videoUrl}
            autoPlay
            muted
            loop
            playsInline
            // Never the LCP element, and decoding it eagerly delays the copy.
            preload="metadata"
          />
        ) : (
          <Mesh layers={HERO_MESH} />
        )}
      </div>
      <div className="stage__scrim" style={{ opacity: 0.35 + progress * 0.45 }} />
      <div className="stage__grain" />
    </div>
  )
}
