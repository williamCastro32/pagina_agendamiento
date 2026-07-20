import { useState } from 'react'
import { ApiError, api, getToken } from '../api'

function AdminLogin({ L, onAuthed, onNavigate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.login(username, password)
      onAuthed()
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401
        ? 'Usuario o contraseña incorrectos.'
        : err.firstMessage)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="login">
      <form className="login__card" onSubmit={submit}>
        <span className="kicker kicker--gold">{L.adminKicker}</span>
        <h1 className="login__title">{L.adminTitle}</h1>
        <p className="login__sub">
          Inicia sesión con tu usuario de Django para editar el contenido del sitio.
        </p>

        {error && <div className="form-error">{error}</div>}

        <div className="admin-grid" style={{ marginBottom: 22 }}>
          <div>
            <label className="admin-label" htmlFor="ad-user">Usuario</label>
            <input
              id="ad-user" className="admin-input" value={username} autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label" htmlFor="ad-pass">Contraseña</label>
            <input
              id="ad-pass" type="password" className="admin-input" value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button className="btn btn--primary btn--md" style={{ width: '100%' }} disabled={busy}>
          {busy ? '…' : 'Entrar'}
        </button>
        <button
          type="button" className="btn--link admin__status"
          style={{ marginTop: 16, width: '100%' }}
          onClick={() => onNavigate('home')}
        >
          ← {L.viewSite}
        </button>
      </form>
    </section>
  )
}

export default function Admin({ L, content, onContentChange, onNavigate }) {
  const [authed, setAuthed] = useState(Boolean(getToken()))
  const [draft, setDraft] = useState(() => structuredClone(content))
  const [adminLang, setAdminLang] = useState('es')
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  if (!authed) {
    return <AdminLogin L={L} onNavigate={onNavigate} onAuthed={() => setAuthed(true)} />
  }

  const t = draft.t[adminLang]
  const dirty = JSON.stringify(draft) !== JSON.stringify(content)

  const setField = (key, value) => setDraft({ ...draft, [key]: value })

  const setLocalized = (key, value) =>
    setDraft({
      ...draft,
      t: { ...draft.t, [adminLang]: { ...t, [key]: value } },
    })

  const setListItem = (listKey, index, field, value) =>
    setDraft({
      ...draft,
      t: {
        ...draft.t,
        [adminLang]: {
          ...t,
          [listKey]: t[listKey].map((item, i) => (i === index ? { ...item, [field]: value } : item)),
        },
      },
    })

  const toggleSlot = (index) =>
    setDraft({
      ...draft,
      slots: draft.slots.map((slot, i) => (i === index ? { ...slot, enabled: !slot.enabled } : slot)),
    })

  function handleAuthFailure() {
    api.logout()
    setAuthed(false)
  }

  async function save() {
    setBusy(true)
    setStatus(null)
    try {
      const response = await api.putContent(draft)
      onContentChange(response.data)
      setDraft(structuredClone(response.data))
      setStatus({ ok: true, message: 'Guardado.' })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        handleAuthFailure()
        return
      }
      setStatus({ ok: false, message: err instanceof ApiError ? err.firstMessage : String(err) })
    } finally {
      setBusy(false)
    }
  }

  async function reset() {
    if (!window.confirm(L.adminResetConfirm)) return
    setBusy(true)
    setStatus(null)
    try {
      const response = await api.resetContent()
      onContentChange(response.data)
      setDraft(structuredClone(response.data))
      setStatus({ ok: true, message: 'Contenido restaurado.' })
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        handleAuthFailure()
        return
      }
      setStatus({ ok: false, message: err instanceof ApiError ? err.firstMessage : String(err) })
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin">
      <div className="container container--xs">
        <div className="admin__top">
          <span className="kicker kicker--gold">{L.adminKicker}</span>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="admin__ghost" onClick={() => onNavigate('home')}>{L.viewSite} →</button>
            <button className="admin__ghost" onClick={handleAuthFailure}>Salir</button>
          </div>
        </div>

        <h1 className="admin__title">{L.adminTitle}</h1>
        <p className="admin__sub">{L.adminSubtitle}</p>

        <div className="admin__langbar">
          <span className="admin__langlabel">{L.editingLang}</span>
          {['es', 'en'].map((code) => (
            <button
              key={code}
              className={`admin__langbtn ${adminLang === code ? 'admin__langbtn--on' : ''}`}
              onClick={() => setAdminLang(code)}
            >
              {code === 'es' ? 'Español' : 'English'}
            </button>
          ))}
        </div>

        {/* ---------------------------------------------------- brand */}
        <div className="admin-card">
          <div className="admin-card__title">
            <span className="admin-card__dot" style={{ background: 'var(--blue-600)' }} />
            {L.secBrand}
          </div>
          <div className="admin-grid">
            <div>
              <label className="admin-label" htmlFor="a-brand">{L.fBrandName}</label>
              <input
                id="a-brand" className="admin-input" value={draft.brandName}
                onChange={(e) => setField('brandName', e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="a-professional">{L.fProfessionalName}</label>
              <input
                id="a-professional" className="admin-input" value={draft.professionalName ?? ''}
                onChange={(e) => setField('professionalName', e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="a-kicker">{L.fKicker}</label>
              <input
                id="a-kicker" className="admin-input" value={t.heroKicker}
                onChange={(e) => setLocalized('heroKicker', e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="a-title">{L.fHeroTitle}</label>
              <textarea
                id="a-title" className="admin-input" rows={2} value={t.heroTitle}
                onChange={(e) => setLocalized('heroTitle', e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="a-sub">{L.fHeroSub}</label>
              <textarea
                id="a-sub" className="admin-input" rows={2} value={t.heroSubtitle}
                onChange={(e) => setLocalized('heroSubtitle', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------ video call */}
        <div className="admin-card">
          <div className="admin-card__title">
            <span className="admin-card__dot" style={{ background: 'var(--gold)' }} />
            {L.secVideoCall}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label className="admin-label" htmlFor="a-session">{L.fSessionLabel}</label>
            <input
              id="a-session" className="admin-input" value={t.sessionLabel ?? ''}
              onChange={(e) => setLocalized('sessionLabel', e.target.value)}
            />
          </div>
          <div className="admin-row">
            <div>
              <label className="admin-label" htmlFor="a-price">{L.fPrice}</label>
              <input
                id="a-price" className="admin-input" value={draft.videoPrice}
                onChange={(e) => setField('videoPrice', e.target.value)}
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="a-dur">{L.fDuration}</label>
              <input
                id="a-dur" className="admin-input" value={draft.videoDuration}
                onChange={(e) => setField('videoDuration', e.target.value)}
              />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label className="admin-label" htmlFor="a-video">{L.fVideoUrl}</label>
            <input
              id="a-video" className="admin-input" value={draft.videoUrl}
              placeholder="https://…/presentacion.mp4"
              onChange={(e) => setField('videoUrl', e.target.value)}
            />
          </div>
          <div style={{ marginTop: 18 }}>
            <span className="admin-label">{L.fSlots}</span>
            <div className="slot-toggles">
              {draft.slots.map((slot, i) => (
                <button
                  key={slot.value}
                  className={`slot-toggle ${slot.enabled ? 'slot-toggle--on' : ''}`}
                  aria-pressed={slot.enabled}
                  onClick={() => toggleSlot(i)}
                >
                  {slot.value}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- areas */}
        <div className="admin-card">
          <div className="admin-card__title">
            <span className="admin-card__dot" style={{ background: 'var(--blue-500)' }} />
            {L.secAreas}
          </div>
          <div className="admin-grid" style={{ gap: 14 }}>
            {t.services.map((service, i) => (
              <div key={i} className="admin-subcard">
                <input
                  className="admin-input" value={service.title}
                  aria-label={`${L.secAreas} ${i + 1}`}
                  onChange={(e) => setListItem('services', i, 'title', e.target.value)}
                />
                <textarea
                  className="admin-input" rows={2} value={service.desc}
                  onChange={(e) => setListItem('services', i, 'desc', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* --------------------------------------------------- social */}
        <div className="admin-card">
          <div className="admin-card__title">
            <span className="admin-card__dot" style={{ background: 'var(--red)' }} />
            {L.secSocial}
          </div>
          <div className="admin-grid" style={{ gap: 14 }}>
            <div className="admin-row">
              <div style={{ flex: 2, minWidth: 160 }}>
                <label className="admin-label" htmlFor="a-ig">{L.fIgHandle}</label>
                <input
                  id="a-ig" className="admin-input" value={draft.igHandle}
                  onChange={(e) => setField('igHandle', e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 110 }}>
                <label className="admin-label" htmlFor="a-igf">{L.fFollowers}</label>
                <input
                  id="a-igf" className="admin-input" value={draft.igFollowers}
                  onChange={(e) => setField('igFollowers', e.target.value)}
                />
              </div>
            </div>
            <div className="admin-row">
              <div style={{ flex: 2, minWidth: 160 }}>
                <label className="admin-label" htmlFor="a-tt">{L.fTtHandle}</label>
                <input
                  id="a-tt" className="admin-input" value={draft.ttHandle}
                  onChange={(e) => setField('ttHandle', e.target.value)}
                />
              </div>
              <div style={{ flex: 1, minWidth: 110 }}>
                <label className="admin-label" htmlFor="a-ttf">{L.fFollowers}</label>
                <input
                  id="a-ttf" className="admin-input" value={draft.ttFollowers}
                  onChange={(e) => setField('ttFollowers', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------- testimonials */}
        <div className="admin-card">
          <div className="admin-card__title">
            <span className="admin-card__dot" style={{ background: 'var(--gold)' }} />
            {L.secTestimonials}
          </div>
          <div className="admin-grid" style={{ gap: 14 }}>
            {t.testimonials.map((item, i) => (
              <div key={i} className="admin-subcard">
                <input
                  className="admin-input" value={item.name}
                  aria-label={`${L.secTestimonials} ${i + 1}`}
                  onChange={(e) => setListItem('testimonials', i, 'name', e.target.value)}
                />
                <textarea
                  className="admin-input" rows={2} value={item.quote}
                  onChange={(e) => setListItem('testimonials', i, 'quote', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ----------------------------------------------- milestones */}
        <div className="admin-card">
          <div className="admin-card__title">
            <span className="admin-card__dot" style={{ background: 'var(--blue-600)' }} />
            {L.secMilestones}
          </div>
          <div className="admin-grid" style={{ gap: 14 }}>
            {t.milestones.map((item, i) => (
              <div key={i} className="admin-subcard">
                <div className="admin-row">
                  <div style={{ flex: 1, minWidth: 90 }}>
                    <label className="admin-label" htmlFor={`a-my-${i}`}>{L.fYear}</label>
                    <input
                      id={`a-my-${i}`} className="admin-input" value={item.year}
                      onChange={(e) => setListItem('milestones', i, 'year', e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 3, minWidth: 160 }}>
                    <label className="admin-label" htmlFor={`a-mt-${i}`}>{L.fMilestoneTitle}</label>
                    <input
                      id={`a-mt-${i}`} className="admin-input" value={item.title}
                      onChange={(e) => setListItem('milestones', i, 'title', e.target.value)}
                    />
                  </div>
                </div>
                <textarea
                  className="admin-input" rows={2} value={item.desc}
                  aria-label={`${L.fMilestoneDesc} ${i + 1}`}
                  onChange={(e) => setListItem('milestones', i, 'desc', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ---------------------------------------------------- stats */}
        <div className="admin-card">
          <div className="admin-card__title">
            <span className="admin-card__dot" style={{ background: 'var(--red)' }} />
            {L.secStats}
          </div>
          <div className="admin-grid" style={{ gap: 14 }}>
            {t.stats.map((stat, i) => (
              <div key={i} className="admin-row">
                {/* The colour is a design token, not copy — it round-trips
                    untouched because setListItem only replaces one field. */}
                <div style={{ flex: 1, minWidth: 90 }}>
                  <label className="admin-label" htmlFor={`a-sv-${i}`}>{L.fStatValue}</label>
                  <input
                    id={`a-sv-${i}`} className="admin-input" value={stat.value}
                    onChange={(e) => setListItem('stats', i, 'value', e.target.value)}
                  />
                </div>
                <div style={{ flex: 3, minWidth: 160 }}>
                  <label className="admin-label" htmlFor={`a-sl-${i}`}>{L.fStatLabel}</label>
                  <input
                    id={`a-sl-${i}`} className="admin-input" value={stat.label}
                    onChange={(e) => setListItem('stats', i, 'label', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin__savebar">
          <button className="btn btn--primary btn--md" onClick={save} disabled={busy || !dirty}>
            {busy ? '…' : dirty ? 'Guardar cambios' : 'Sin cambios'}
          </button>
          <button className="admin__ghost" onClick={reset} disabled={busy}>
            {L.adminReset}
          </button>
          {status && (
            <span className={`admin__status ${status.ok ? 'admin__status--ok' : 'admin__status--err'}`}>
              {status.message}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
