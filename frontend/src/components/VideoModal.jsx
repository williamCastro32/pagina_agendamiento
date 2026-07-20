import { useEffect, useRef } from 'react'

export default function VideoModal({ videoUrl, L, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={L.playVideo} onClick={onClose}>
      <div className="modal__box" onClick={(e) => e.stopPropagation()}>
        <button ref={closeRef} className="modal__close" onClick={onClose} aria-label={L.back}>
          ×
        </button>

        {videoUrl ? (
          <video className="modal__video" src={videoUrl} controls autoPlay playsInline />
        ) : (
          <div className="modal__placeholder">
            <div className="modal__ring">
              <div className="modal__tri" />
            </div>
            <div className="modal__title">{L.videoPlaceholderTitle}</div>
            <div className="modal__body">{L.videoPlaceholderBody}</div>
          </div>
        )}
      </div>
    </div>
  )
}
