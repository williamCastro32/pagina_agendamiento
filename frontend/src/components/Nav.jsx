const LANGS = ['es', 'en']

export default function Nav({ brandName, screen, lang, L, onNavigate, onSetLang, dark }) {
  const items = [
    { key: 'home', label: L.navInicio },
    { key: 'about', label: L.navAbout },
    { key: 'services', label: L.navServices },
    { key: 'social', label: L.navSocial },
  ]

  return (
    <header className={`nav ${dark ? 'nav--dark' : 'nav--light'}`}>
      <div className="nav__inner">
        <button className="brand" onClick={() => onNavigate('home')}>
          <span className="brand__mark" aria-hidden="true">G</span>
          <span className="brand__name">{brandName}</span>
        </button>

        <nav className="nav__links" aria-label={L.navInicio}>
          {items.map((item) => (
            <button
              key={item.key}
              className={`pill ${screen === item.key ? 'pill--active' : ''}`}
              aria-current={screen === item.key ? 'page' : undefined}
              onClick={() => onNavigate(item.key)}
            >
              {item.label}
            </button>
          ))}

          <button className="pill pill--cta" onClick={() => onNavigate('booking')}>
            {L.navAgendar}
          </button>
          {/* Admin used to sit here. It is the owner's door, not a visitor's,
              and putting it in the primary nav advertised it to everyone. It
              now lives in the footer. */}

          <div className="lang">
            {LANGS.map((code) => (
              <button
                key={code}
                className={`lang__btn ${lang === code ? 'lang__btn--active' : ''}`}
                aria-pressed={lang === code}
                onClick={() => onSetLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
