/**
 * Site footer. Also the only entrance to the Admin screen.
 *
 * The admin link is deliberately quiet and last: it is the owner's door, and
 * in the primary nav it advertised itself to every visitor. Quiet, not hidden —
 * an unlabelled secret would be worse, because the owner has to find it too.
 */
export default function Footer({ content, L, onNavigate }) {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <span className="footer__mark" aria-hidden="true">
            {content.brandName?.[0] ?? '•'}
          </span>
          <span className="footer__name">{content.brandName}</span>
        </div>

        <nav className="footer__links" aria-label={L.footerNav}>
          <button className="footer__link" onClick={() => onNavigate('home')}>{L.navInicio}</button>
          <button className="footer__link" onClick={() => onNavigate('services')}>{L.navServices}</button>
          <button className="footer__link" onClick={() => onNavigate('social')}>{L.navSocial}</button>
          <button className="footer__link" onClick={() => onNavigate('booking')}>{L.navAgendar}</button>
        </nav>

        <div className="footer__meta">
          <span>© {year} {content.brandName}</span>
          <span className="footer__dot" aria-hidden="true">·</span>
          <a
            className="footer__credit"
            href="https://www.idatiaco.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            {L.developedBy} idatiaco.com
          </a>
          {/* No separator before this one: it is pushed to the far right, so a
              dot would be left stranded mid-row. */}
          <button className="footer__admin" onClick={() => onNavigate('admin')}>
            {L.adminEntry}
          </button>
        </div>
      </div>
    </footer>
  )
}
