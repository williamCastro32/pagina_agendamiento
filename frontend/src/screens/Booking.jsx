import { useEffect, useMemo, useState } from 'react'
import { ApiError, api } from '../api'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emptyForm = { name: '', phone: '', email: '', notes: '' }
const emptyCard = { cardName: '', cardNumber: '', expiry: '', cvc: '' }

export default function Booking({ content, L, lang, onNavigate, onBooked }) {
  const [step, setStep] = useState(1)
  const [availability, setAvailability] = useState(null)
  const [loadFailed, setLoadFailed] = useState(false)

  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [card, setCard] = useState(emptyCard)
  const [payMethod, setPayMethod] = useState('card')

  const [booking, setBooking] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .getAvailability()
      .then(setAvailability)
      .catch(() => setLoadFailed(true))
  }, [])

  const days = availability?.days ?? []
  const selectedDay = days.find((d) => d.date === date) ?? null

  // Reset a time that is not offered on the newly picked day.
  useEffect(() => {
    if (!selectedDay || !time) return
    const stillThere = selectedDay.slots.some((s) => s.value === time && s.available)
    if (!stillThere) setTime(null)
  }, [selectedDay, time])

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(date && time)
    if (step === 2) return Boolean(form.name.trim() && form.phone.trim() && EMAIL_RE.test(form.email.trim()))
    return Boolean(card.cardName.trim() && card.cardNumber.trim() && card.expiry.trim() && card.cvc.trim())
  }, [step, date, time, form, card])

  const summary = selectedDay && time
    ? `${L.weekdays[selectedDay.weekday]} ${selectedDay.day} · ${time}`
    : L.selectDateTime

  // Identifies the booking the server already holds, so stepping back and
  // forward reuses it instead of creating a duplicate.
  const signature = `${date}|${time}|${form.email.trim()}|${form.name.trim()}|${form.phone.trim()}|${form.notes.trim()}`

  async function handleContinue() {
    if (!canContinue || busy) return
    setError(null)

    if (step === 1) {
      setStep(2)
      return
    }

    if (step === 2) {
      if (booking?.signature === signature) {
        setStep(3)
        return
      }
      setBusy(true)
      try {
        const created = await api.createBooking({
          date,
          time,
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          notes: form.notes.trim(),
          language: lang,
        })
        setBooking({ ...created, signature })
        setStep(3)
      } catch (err) {
        setError(err instanceof ApiError ? err.firstMessage : String(err))
        if (err instanceof ApiError && err.status === 400) {
          // The slot may have gone; refresh so the grid tells the truth.
          api.getAvailability().then(setAvailability).catch(() => {})
        }
      } finally {
        setBusy(false)
      }
      return
    }

    // Step 3 — confirm. Card fields never leave the browser: this call only
    // flips the booking to "paid" server-side. Swap for a real processor
    // (Stripe Elements + webhook) before taking money.
    setBusy(true)
    try {
      const paid = await api.payBooking(booking.reference)
      onBooked({ ...paid, weekdayLabel: L.weekdays[selectedDay.weekday], dayNumber: selectedDay.day })
    } catch (err) {
      setError(err instanceof ApiError ? err.firstMessage : String(err))
    } finally {
      setBusy(false)
    }
  }

  const stepLabels = [L.stepHorario, L.stepDatos, L.stepPago]

  return (
    <section className="section section--sand section--page">
      <div className="container container--form">
        <span className="kicker kicker--red">{L.bookKicker}</span>
        <h1 className="h-page" style={{ margin: '12px 0 30px', fontSize: 'clamp(28px,5vw,44px)', letterSpacing: '-1.5px' }}>
          {L.bookTitle}
        </h1>

        <ol className="steps" style={{ listStyle: 'none', padding: 0 }}>
          {stepLabels.map((label, i) => {
            const num = i + 1
            const done = step > num
            const on = step >= num
            return (
              <li key={label} className="steps__item">
                <span className={`steps__num ${on ? 'steps__num--on' : ''}`}>{done ? '✓' : num}</span>
                <span className={`steps__label ${step === num ? 'steps__label--on' : ''}`}>{label}</span>
                {num < stepLabels.length && <span className={`steps__line ${done ? 'steps__line--on' : ''}`} />}
              </li>
            )
          })}
        </ol>

        {loadFailed && <div className="form-error">No se pudieron cargar los horarios disponibles.</div>}
        {error && <div className="form-error">{error}</div>}

        {/* ------------------------------------------------ step 1 */}
        {step === 1 && (
          <div style={{ marginBottom: 30 }}>
            <div className="field-label">{L.chooseDay}</div>
            <div className="date-row">
              {days.map((d) => (
                <button
                  key={d.date}
                  className={`date-chip ${date === d.date ? 'date-chip--on' : ''}`}
                  disabled={!d.hasAvailability}
                  aria-pressed={date === d.date}
                  onClick={() => { setDate(d.date); setTime(null) }}
                >
                  <div className="date-chip__wd">{L.weekdays[d.weekday]}</div>
                  <div className="date-chip__day">{d.day}</div>
                </button>
              ))}
              {!availability && !loadFailed && <div className="muted">…</div>}
            </div>

            <div className="field-label">{L.chooseTime}</div>
            <div className="time-grid">
              {(selectedDay?.slots ?? []).map((slot) => (
                <button
                  key={slot.value}
                  className={`time-chip ${time === slot.value ? 'time-chip--on' : ''}`}
                  disabled={!slot.available}
                  aria-pressed={time === slot.value}
                  onClick={() => setTime(slot.value)}
                >
                  {slot.value}
                </button>
              ))}
            </div>
            {!selectedDay && <p className="muted" style={{ marginTop: 12 }}>{L.chooseDay}</p>}
          </div>
        )}

        {/* ------------------------------------------------ step 2 */}
        {step === 2 && (
          <>
            <div className="summary-card">
              <div className="summary-card__label">{L.yourCall}</div>
              <div className="summary-card__value">{summary}</div>
              <div className="summary-card__meta">{content.videoDuration} · {content.videoPrice}</div>
            </div>

            <div className="form-stack">
              <div>
                <label className="label" htmlFor="bk-name">{L.fullName}</label>
                <input
                  id="bk-name" className="input" value={form.name} placeholder={L.phName}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="bk-phone">{L.phone}</label>
                <input
                  id="bk-phone" className="input" value={form.phone} placeholder="+00 000 000 0000"
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="bk-email">{L.emailLabel}</label>
                <input
                  id="bk-email" type="email" className="input" value={form.email} placeholder="tucorreo@email.com"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="bk-notes">{L.notesLabel}</label>
                <textarea
                  id="bk-notes" className="input" rows={3} value={form.notes} placeholder={L.phNotes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        {/* ------------------------------------------------ step 3 */}
        {step === 3 && (
          <>
            <div className="total-band">
              <div>
                <div className="total-band__label">{L.totalToPay}</div>
                <div className="total-band__meta">{L.videocall} · {summary}</div>
              </div>
              <div className="total-band__amount">{booking?.price ?? content.videoPrice}</div>
            </div>

            <div className="pay-methods">
              {L.payMethods.map((label, i) => {
                const key = ['card', 'paypal', 'transfer'][i]
                return (
                  <button
                    key={key}
                    className={`pay-method ${payMethod === key ? 'pay-method--on' : ''}`}
                    aria-pressed={payMethod === key}
                    onClick={() => setPayMethod(key)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="demo-note">
              {lang === 'es'
                ? 'Demo: no se cobra nada y los datos de la tarjeta no salen de tu navegador. Conecta una pasarela real (Stripe) antes de aceptar pagos.'
                : 'Demo: nothing is charged and the card details never leave your browser. Connect a real processor (Stripe) before taking payments.'}
            </div>

            <div className="form-stack" style={{ marginBottom: 22 }}>
              <div>
                <label className="label" htmlFor="pay-name">{L.cardName}</label>
                <input
                  id="pay-name" className="input" value={card.cardName} placeholder={L.phCardName}
                  autoComplete="off"
                  onChange={(e) => setCard({ ...card, cardName: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="pay-number">{L.cardNumber}</label>
                <input
                  id="pay-number" className="input" value={card.cardNumber} placeholder="0000 0000 0000 0000"
                  inputMode="numeric" autoComplete="off" style={{ letterSpacing: 1 }}
                  onChange={(e) => setCard({ ...card, cardNumber: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div>
                  <label className="label" htmlFor="pay-exp">{L.expiry}</label>
                  <input
                    id="pay-exp" className="input" value={card.expiry} placeholder="MM/AA" autoComplete="off"
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="pay-cvc">CVC</label>
                  <input
                    id="pay-cvc" className="input" value={card.cvc} placeholder="123"
                    inputMode="numeric" autoComplete="off"
                    onChange={(e) => setCard({ ...card, cvc: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="secure-note">
              <span className="lock" aria-hidden="true" />
              {L.securePayment}
            </div>
          </>
        )}

        <div className="wizard-actions">
          {step > 1 && (
            <button className="btn btn--back" onClick={() => { setError(null); setStep(step - 1) }} disabled={busy}>
              {L.back}
            </button>
          )}
          <button
            className="btn btn--primary btn--next"
            onClick={handleContinue}
            disabled={!canContinue || busy}
          >
            {busy ? '…' : step === 3 ? `${L.pay} ${booking?.price ?? content.videoPrice}` : L.continueBtn}
          </button>
        </div>

        <button
          className="btn--link muted"
          style={{ marginTop: 20, display: 'block' }}
          onClick={() => onNavigate('home')}
        >
          ← {L.backHome}
        </button>
      </div>
    </section>
  )
}
