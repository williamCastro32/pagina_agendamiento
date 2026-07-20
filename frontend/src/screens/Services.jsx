export default function Services({ content, ct, L, onNavigate }) {
  const services = ct.services.map((s, i) => ({
    ...s,
    cardBg: content.cardBgs[i % content.cardBgs.length],
  }))

  return (
    <section className="section section--sand section--page">
      <div className="container container--sm">
        <span className="kicker kicker--red">{L.consKicker}</span>
        <h1 className="h-page" style={{ margin: '14px 0 16px' }}>{L.consTitle}</h1>
        <p className="body-text" style={{ margin: '0 0 20px', maxWidth: 560, color: 'var(--ink-500)', lineHeight: 1.65 }}>
          {L.consIntroPre} <strong>{L.consIntroStrong}</strong> {L.consIntroPost}
        </p>

        <div className="price-band">
          <div className="price-band__col">
            <div className="price-band__label">{L.privateCallLabel}</div>
            <div className="price-band__value">{content.videoPrice}</div>
            <div className="price-band__meta">{content.videoDuration} · {L.singlePayment}</div>
          </div>
          <button
            className="btn btn--primary"
            style={{ padding: '16px 30px', fontSize: 15, fontWeight: 700 }}
            onClick={() => onNavigate('booking')}
          >
            {L.bookNow} →
          </button>
        </div>

        <h2 className="h-sub">{L.whatTogether}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16 }}>
          {services.map((service) => (
            <article key={service.title} className="service-tile">
              <div className="service-tile__swatch" style={{ background: service.cardBg }} aria-hidden="true" />
              <h3 className="service-tile__title">{service.title}</h3>
              <p className="service-tile__desc">{service.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
