import Mesh, { CONFIRM_MESH } from '../components/Mesh'

const CONFETTI = [
  { left: '20%', background: '#d4a13d', duration: '3.2s', delay: '0s', size: 7 },
  { left: '40%', background: '#a4302a', duration: '3.8s', delay: '.4s', size: 6 },
  { left: '60%', background: '#3a6ea8', duration: '3.4s', delay: '.8s', size: 7 },
  { left: '75%', background: '#f6f1e6', duration: '4s', delay: '.2s', size: 6 },
  { left: '87%', background: '#d4a13d', duration: '3.6s', delay: '1.1s', size: 6 },
]

export default function Confirmation({ L, booking, onNavigate }) {
  const when = booking
    ? `${booking.weekdayLabel ?? ''} ${booking.dayNumber ?? ''} · ${booking.time}`.trim()
    : ''

  return (
    <section className="confirm">
      <Mesh layers={CONFIRM_MESH} spread="mesh--tight" />
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confetti"
          aria-hidden="true"
          style={{
            left: c.left, background: c.background, width: c.size, height: c.size,
            animationDuration: c.duration, animationDelay: c.delay,
          }}
        />
      ))}

      <div className="confirm__card">
        <div className="confirm__check" aria-hidden="true" />
        <h1 className="confirm__title">{L.confTitle}</h1>
        <p className="confirm__sub">
          {L.confSubtitle}
          <br />
          <strong>{when}</strong>
        </p>

        <div className="next-steps">
          <div className="next-steps__label">{L.nextSteps}</div>
          <ul className="next-steps__list">
            <li>{L.nextStep1}</li>
            <li>{L.nextStep2}</li>
            <li>{L.nextStep3}</li>
          </ul>
        </div>

        <div className="confirm__actions">
          <button className="btn btn--ghost-light btn--xs">{L.share}</button>
          <button className="btn btn--ghost-light btn--xs">{L.addCalendar}</button>
        </div>

        <button className="confirm__back" onClick={() => onNavigate('home')}>
          {L.backHome}
        </button>

        {booking?.reference && (
          <div className="confirm__ref">Ref. {booking.reference.slice(0, 8).toUpperCase()}</div>
        )}
      </div>
    </section>
  )
}
