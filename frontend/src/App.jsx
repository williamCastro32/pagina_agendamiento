import { useCallback, useEffect, useState } from 'react'
import { api } from './api'
import { getUI } from './i18n'
import Nav from './components/Nav'
import VideoModal from './components/VideoModal'
import Home from './screens/Home'
import About from './screens/About'
import Social from './screens/Social'
import Services from './screens/Services'
import Booking from './screens/Booking'
import Confirmation from './screens/Confirmation'
import Admin from './screens/Admin'

// Screens whose first fold is dark, so the nav flips to its dark treatment.
const DARK_SCREENS = new Set(['home', 'confirmation', 'admin'])

export default function App() {
  const [screen, setScreen] = useState('home')
  const [lang, setLang] = useState('es')
  const [videoOpen, setVideoOpen] = useState(false)
  const [content, setContent] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [lastBooking, setLastBooking] = useState(null)

  useEffect(() => {
    api
      .getContent()
      .then((response) => setContent(response.data))
      .catch((error) => setLoadError(error))
  }, [])

  const navigate = useCallback((next) => {
    setScreen(next)
    window.scrollTo(0, 0)
  }, [])

  const onBooked = useCallback((booking) => {
    setLastBooking(booking)
    setScreen('confirmation')
    window.scrollTo(0, 0)
  }, [])

  // The tab title is content, not chrome: this template is re-skinned per
  // customer, so index.html cannot hardcode it.
  useEffect(() => {
    if (content?.brandName) document.title = content.brandName
  }, [content])

  if (loadError) {
    return (
      <div className="loading">
        <p style={{ color: '#f6f1e6', font: "400 15px 'Inter'", textAlign: 'center', maxWidth: 420 }}>
          No se pudo cargar el contenido del sitio.
          <br />
          <span style={{ color: '#8ba0b6', fontSize: 13 }}>
            ¿Está corriendo el backend en http://127.0.0.1:8000?
          </span>
        </p>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="loading">
        <div className="spinner" role="status" aria-label="Cargando" />
      </div>
    )
  }

  // Below the guards on purpose: getUI needs content to resolve {name}.
  const L = getUI(lang, content)
  const ct = content.t[lang]
  const dark = DARK_SCREENS.has(screen)

  const shared = { content, ct, L, lang, onNavigate: navigate }

  return (
    <div className={`app ${dark ? 'app--dark' : 'app--light'}`}>
      <Nav
        brandName={content.brandName}
        screen={screen}
        lang={lang}
        L={L}
        dark={dark}
        onNavigate={navigate}
        onSetLang={setLang}
      />

      {videoOpen && (
        <VideoModal videoUrl={content.videoUrl} L={L} onClose={() => setVideoOpen(false)} />
      )}

      <main>
        {screen === 'home' && <Home {...shared} onOpenVideo={() => setVideoOpen(true)} />}
        {screen === 'about' && <About {...shared} />}
        {screen === 'social' && <Social {...shared} />}
        {screen === 'services' && <Services {...shared} />}
        {screen === 'booking' && <Booking {...shared} onBooked={onBooked} />}
        {screen === 'confirmation' && <Confirmation {...shared} booking={lastBooking} />}
        {screen === 'admin' && <Admin L={L} content={content} onContentChange={setContent} onNavigate={navigate} />}
      </main>
    </div>
  )
}
