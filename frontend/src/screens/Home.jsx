import Mesh, { CTA_MESH } from '../components/Mesh'
import Reveal from '../components/Reveal'
import ScrollStage from '../components/ScrollStage'

const SPARKS = [
  { top: '20%', left: '15%', size: 5, background: '#d4a13d', animation: 'drift 6s ease-in-out infinite' },
  { top: '30%', left: '82%', size: 4, background: '#eef2f6', animation: 'drift 8s ease-in-out infinite 1s' },
  { top: '64%', left: '40%', size: 3, background: '#eef2f6', animation: 'shimmer 3s ease-in-out infinite' },
]

export default function Home({ content, ct, L, lang, onNavigate, onOpenVideo }) {
  const services = ct.services.map((s, i) => ({
    ...s,
    cardBg: content.cardBgs[i % content.cardBgs.length],
  }))
  const testimonials = ct.testimonials.map((t, i) => ({
    ...t,
    avatarBg: content.avatarBgs[i % content.avatarBgs.length],
  }))

  return (
    <>
      {/* The fixed backdrop. Rendered here, not in App, so it unmounts with
          the screen — the other screens are light and want no video behind. */}
      <ScrollStage videoUrl={content.videoUrl} />

      {/* ---------------------------------------------------------- hero */}
      <section className="hero">
        <div className="hero__veil" aria-hidden="true" />
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="spark"
            aria-hidden="true"
            style={{
              top: s.top, left: s.left, width: s.size, height: s.size,
              background: s.background, animation: s.animation,
            }}
          />
        ))}

        <div className="hero__content">
          <Reveal as="span" className="hero__kicker">{ct.heroKicker}</Reveal>
          <Reveal as="h1" className="hero__title" delay={90}>{ct.heroTitle}</Reveal>
          <Reveal as="p" className="hero__subtitle" delay={180}>{ct.heroSubtitle}</Reveal>
          <Reveal className="hero__actions" delay={270}>
            <button className="btn btn--primary btn--lg" onClick={() => onNavigate('booking')}>
              {L.ctaAgendar} →
            </button>
            <button className="btn btn--ghost-light btn--sm" onClick={onOpenVideo}>
              <span className="play-badge" aria-hidden="true">
                <span className="play-tri" />
              </span>
              {L.playVideo}
            </button>
          </Reveal>
        </div>
        <div className="hero__scroll" aria-hidden="true">{L.scroll}</div>
      </section>

      {/* ----------------------------------------------------- statement */}
      <section className="section section--sand">
        <div className="container container--md">
          <span className="kicker kicker--blue">{L.whyKicker}</span>
          <h2 className="statement__title">{L.whyTitle}</h2>
          <div className="stats">
            {ct.stats.map((stat) => (
              <div key={stat.label}>
                <div className="stat__value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat__label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ services */}
      <section className="section section--ice">
        <div className="container">
          <div className="section__head">
            <div>
              <span className="kicker kicker--blue">{L.servKicker}</span>
              <h2 className="h-section">{L.servTitle}</h2>
            </div>
            <p className="section__note">
              {L.servNotePre} <strong>{L.servNoteStrong}</strong> {L.servNotePost}
            </p>
          </div>

          <div className="service-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card" style={{ background: service.cardBg }}>
                <div className="service-card__glyph" aria-hidden="true" />
                <div className="service-card__body">
                  <h3 className="service-card__title">{service.title}</h3>
                  <p className="service-card__desc">{service.desc}</p>
                </div>
              </article>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
            <button className="btn btn--primary btn--md" onClick={() => onNavigate('booking')}>
              {L.ctaAgendarMi} →
            </button>
            <button className="btn btn--ghost-dark btn--sm" onClick={() => onNavigate('services')}>
              {L.verDetalle}
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- about teaser */}
      <section className="section section--sand">
        <div className="container about-grid">
          <div className="photo-placeholder photo-placeholder--teaser" style={{ whiteSpace: 'pre-line' }}>
            {L.photoPlaceholder}
          </div>
          <div>
            <span className="kicker kicker--red">{L.aboutKicker}</span>
            <h2 className="h-section" style={{ margin: '16px 0 18px' }}>{L.aboutTeaserTitle}</h2>
            <p className="body-text" style={{ fontSize: 15.5, margin: '0 0 26px', maxWidth: 480 }}>
              {L.aboutTeaserBody}
            </p>
            <button className="btn btn--ghost-dark btn--sm" onClick={() => onNavigate('about')}>
              {L.aboutTeaserBtn} →
            </button>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- testimonials */}
      <section className="section section--ice" style={{ padding: 'clamp(56px,9vw,110px) 0', overflow: 'hidden' }}>
        <div className="container" style={{ padding: '0 clamp(20px,6vw,72px)' }}>
          <span className="kicker kicker--blue">{L.commKicker}</span>
          <h2 className="h-section">{L.commTitle}</h2>
        </div>

        <div className="marquee">
          {/* Doubled so the -50% translation loops seamlessly. */}
          <div className="marquee__track">
            {[...testimonials, ...testimonials].map((t, i) => (
              <article key={i} className="quote-card quote-card--marquee" aria-hidden={i >= testimonials.length}>
                <div className="stars" aria-label="5/5">★★★★★</div>
                <p className="quote-card__text">"{t.quote}"</p>
                <div className="quote-card__who">
                  <div className="avatar" style={{ background: t.avatarBg }} aria-hidden="true" />
                  <div className="quote-card__name">{t.name}</div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <button className="btn btn--primary btn--sm" onClick={() => onNavigate('social')}>
            {L.followMe} →
          </button>
        </div>
      </section>

      {/* ----------------------------------------------------- cta final */}
      <section className="cta-final">
        <Mesh layers={CTA_MESH} spread="mesh--tight" />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto' }}>
          <h2 className="cta-final__title">{L.finalTitle}</h2>
          <button
            className="btn btn--cream"
            style={{ padding: '19px 36px', fontSize: 16.5 }}
            onClick={() => onNavigate('booking')}
          >
            {L.ctaAgendar} →
          </button>
        </div>

        <footer className="footer">
          <span className="footer__copy">© 2026 {content.brandName}</span>
          <div className="footer__links">
            <button className="footer__link" onClick={() => onNavigate('social')}>Instagram</button>
            <button className="footer__link" onClick={() => onNavigate('social')}>TikTok</button>
            <button className="footer__link" onClick={() => onNavigate('admin')}>Admin</button>
          </div>
        </footer>
      </section>
    </>
  )
}
