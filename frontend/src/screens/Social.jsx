// Decorative stand-ins until real feed embeds are wired up.
const POSTS = [
  { c1: '#dfe7ef', c2: '#cdd9e6', isVideo: false },
  { c1: '#cdd8e4', c2: '#a9b6c4', isVideo: true },
  { c1: '#e8c9c2', c2: '#d6a89c', isVideo: false },
  { c1: '#d8caab', c2: '#c2b48f', isVideo: false },
  { c1: '#c2cfe0', c2: '#9fb0c9', isVideo: true },
  { c1: '#dfe7ef', c2: '#c9d3df', isVideo: false },
]

export default function Social({ content, ct, L }) {
  const testimonials = ct.testimonials.map((t, i) => ({
    ...t,
    avatarBg: content.avatarBgs[i % content.avatarBgs.length],
  }))

  return (
    <section className="section section--sand section--page">
      <div className="container container--md">
        <span className="kicker kicker--blue">{L.socialKicker}</span>
        <h1 className="h-page">{L.socialTitle}</h1>

        <div className="social-grid">
          <div className="social-card social-card--ig">
            <div className="social-card__name">Instagram</div>
            <div className="social-card__meta">
              {content.igHandle} · {content.igFollowers} {L.followers}
            </div>
            <button className="social-card__btn">{L.follow}</button>
          </div>

          <div className="social-card social-card--tt">
            <div className="social-card__name">TikTok</div>
            <div className="social-card__meta" style={{ opacity: 0.8 }}>
              {content.ttHandle} · {content.ttFollowers} {L.followers}
            </div>
            <button className="social-card__btn">{L.follow}</button>
          </div>
        </div>

        <h2 className="h-minor">{L.recentContent}</h2>
        <div className="post-grid">
          {POSTS.map((post, i) => (
            <button
              key={i}
              className="post"
              aria-label={`${L.recentContent} ${i + 1}`}
              style={{
                background: `repeating-linear-gradient(135deg,${post.c1},${post.c1} 8px,${post.c2} 8px,${post.c2} 16px)`,
              }}
            >
              {post.isVideo && <span className="post__play" aria-hidden="true" />}
            </button>
          ))}
        </div>

        <h2 className="h-minor">{L.testimonialsTitle}</h2>
        <div className="quote-grid">
          {testimonials.map((t) => (
            <article key={t.name} className="quote-card quote-card--grid">
              <div className="quote-card__who" style={{ marginBottom: 14 }}>
                <div className="avatar avatar--sm" style={{ background: t.avatarBg }} aria-hidden="true" />
                <div>
                  <div className="quote-card__name" style={{ fontSize: 13.5 }}>{t.name}</div>
                  <div className="stars stars--sm" aria-label="5/5">★★★★★</div>
                </div>
              </div>
              <p className="quote-card__text" style={{ fontSize: 13.5, marginBottom: 0 }}>"{t.quote}"</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
