import Mesh, { PANEL_MESH } from '../components/Mesh'

export default function About({ L, ct, onNavigate }) {
  const milestones = ct.milestones

  return (
    <section className="section section--sand section--page">
      <div className="container container--xs">
        <span className="kicker kicker--red">{L.aboutKicker}</span>
        <h1 className="h-page" style={{ margin: '14px 0 30px', fontSize: 'clamp(34px,6vw,66px)' }}>
          {L.aboutTitle}
        </h1>

        <div className="about-head">
          <div className="photo-placeholder photo-placeholder--page" style={{ whiteSpace: 'pre-line' }}>
            {L.photoPlaceholder}
          </div>
          <div className="about-head__text">
            <p className="body-text" style={{ margin: '0 0 18px' }}>{L.aboutBody1}</p>
            <p className="body-text" style={{ margin: 0 }}>{L.aboutBody2}</p>
          </div>
        </div>

        <h2 className="h-sub" style={{ fontSize: 22, margin: '0 0 26px' }}>{L.trajTitle}</h2>
        <ol className="timeline" style={{ listStyle: 'none', padding: 0, margin: '0 0 56px' }}>
          {milestones.map((m, i) => (
            <li key={m.year} className="timeline__row">
              <div className="timeline__rail" aria-hidden="true">
                <div className="timeline__dot" />
                {i < milestones.length - 1 && <div className="timeline__line" />}
              </div>
              <div className="timeline__body">
                <div className="timeline__year">{m.year}</div>
                <div className="timeline__title">{m.title}</div>
                <div className="timeline__desc">{m.desc}</div>
              </div>
            </li>
          ))}
        </ol>

        <div className="panel-cta">
          <Mesh layers={PANEL_MESH} spread="mesh--wide" />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h3 className="panel-cta__title">{L.aboutCtaTitle}</h3>
            <button
              className="btn btn--primary"
              style={{ padding: '16px 30px', fontSize: 15, fontWeight: 700 }}
              onClick={() => onNavigate('booking')}
            >
              {L.ctaAgendar} →
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
