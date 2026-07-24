// Interface copy, keyed by language — the fixed labels of the app shell.
// Editable site *content* lives in the SiteContent row and is reached through
// the Admin screen; these strings are not editable and ship with the code.
//
// This is a resold template, so nothing here may name a specific business or
// sector. Where the professional's name belongs, write the {name} placeholder:
// getUI() substitutes it from content.professionalName, which the buyer sets
// once in the Admin screen.

export const UI = {
  es: {
    navInicio: 'Inicio', navAbout: 'Sobre {name}', navServices: 'Servicios', navSocial: 'Redes', navAgendar: 'Agendar',
    ctaAgendar: 'Agendar {session}', ctaAgendarMi: 'Agendar mi {session}', playVideo: 'Ver presentación', scroll: 'DESLIZA',
    videoPlaceholderTitle: 'Video de presentación', videoPlaceholderBody: 'Añade la URL de tu video en el panel Admin y se reproducirá aquí.',
    whyKicker: 'POR QUÉ {name}', whyTitle: 'Atención personal, no fórmulas genéricas',
    servKicker: 'EN QUÉ ACOMPAÑO', servTitle: 'Áreas de trabajo',
    servNotePre: 'Todas las sesiones se realizan en una', servNoteStrong: '{session} privada', servNotePost: ', por respeto a tu intimidad. Un solo servicio, adaptado a ti.',
    verDetalle: 'Ver detalle de los servicios',
    aboutKicker: 'SOBRE MÍ', aboutTeaserTitle: 'Experiencia a tu servicio',
    aboutTeaserBody: 'Acompaño a quienes buscan claridad y dirección en los momentos que definen su camino. Cada sesión es un espacio íntimo, sin juicios.',
    aboutTeaserBtn: 'Conoce mi historia',
    commKicker: 'COMUNIDAD', commTitle: 'Lo que dicen quienes ya reservaron', followMe: 'Sígueme en redes',
    finalTitle: '¿Listo para dar el siguiente paso?',
    aboutTitle: 'Quién te acompaña',
    aboutBody1: '{name} lleva años acompañando a las personas que buscan respuestas más allá de lo evidente, combinando la escucha atenta con la experiencia acumulada.',
    aboutBody2: 'Cada sesión es un espacio íntimo y personal. {name} entiende que su labor es iluminar el camino que cada persona ya lleva dentro — nunca imponerlo.',
    trajTitle: 'Formación y trayectoria', aboutCtaTitle: '¿Sientes que es momento de hablar?',
    socialKicker: 'REDES SOCIALES', socialTitle: 'Sígueme en el camino', followers: 'seguidores', follow: 'Seguir',
    recentContent: 'Contenido reciente', testimonialsTitle: 'Testimonios',
    consKicker: 'LAS SESIONES', consTitle: 'Una {session}, toda mi atención',
    consIntroPre: 'Por respeto a tu privacidad, todas las sesiones se realizan en una', consIntroStrong: '{session} privada, uno a uno', consIntroPost: 'con {name}. Siempre uno a uno, nunca en grupo.',
    privateCallLabel: '{SESSION} PRIVADA', singlePayment: 'Pago único y seguro', bookNow: 'Agendar ahora', whatTogether: 'Qué podemos ver juntos',
    bookKicker: 'AGENDAR {SESSION}', bookTitle: 'Reserva tu espacio',
    stepHorario: 'Horario', stepDatos: 'Tus datos', stepPago: 'Pago',
    chooseDay: 'Elige un día', chooseTime: 'Elige un horario', yourCall: 'TU {SESSION}',
    fullName: 'Nombre completo', phName: 'Tu nombre', phone: 'WhatsApp / Teléfono', emailLabel: 'Correo (recibirás los detalles aquí)',
    notesLabel: 'Cuéntame brevemente qué te trae (opcional)', phNotes: 'Escribe aquí...',
    totalToPay: 'TOTAL A PAGAR', videocall: '{Session}', cardName: 'Nombre en la tarjeta', phCardName: 'Como aparece en la tarjeta',
    cardNumber: 'Número de tarjeta', expiry: 'Vencimiento', securePayment: 'Pago cifrado. No almacenamos los datos de tu tarjeta.',
    back: 'Atrás', continueBtn: 'Continuar', pay: 'Pagar',
    confTitle: '¡Pago confirmado!', confSubtitle: 'Tu {session} con {name} está reservada.',
    nextSteps: 'PRÓXIMOS PASOS',
    nextStep1: 'Recibirás los detalles de tu {session} por correo y WhatsApp.',
    nextStep2: 'Te enviaré un recordatorio 1 día antes.',
    nextStep3: 'Busca un espacio tranquilo y llega con la mente abierta.',
    share: 'Compartir', addCalendar: 'Añadir al calendario', backHome: 'Volver al inicio',
    adminKicker: 'PANEL DE ADMINISTRACIÓN', viewSite: 'Ver sitio', adminTitle: 'Editar toda la app',
    adminSubtitle: 'Los cambios se reflejan al instante. Los textos se editan por idioma; usa el selector de abajo.',
    editingLang: 'Editando idioma:',
    secBrand: 'Marca y portada', fBrandName: 'Nombre de marca', fProfessionalName: 'Nombre de quien atiende (aparece en toda la web)',
    fKicker: 'Etiqueta superior', fHeroTitle: 'Titular principal (Enter = salto de línea)', fHeroSub: 'Subtítulo',
    secVideoCall: '{Session} (producto de pago)', fPrice: 'Precio', fDuration: 'Duración', fBackgroundVideoUrl: 'Video de fondo de la portada (corto, sin sonido, se repite)',
    fVideoUrl: 'Video de presentación (el que se abre al pulsar reproducir)', fSlots: 'Horarios disponibles (activa / desactiva)',
    secAreas: 'Áreas de trabajo (informativas)', secSocial: 'Redes sociales', fIgHandle: 'Instagram — usuario', fTtHandle: 'TikTok — usuario', fFollowers: 'Seguidores',
    secTestimonials: 'Testimonios',
    secMilestones: 'Trayectoria (línea de tiempo)', fYear: 'Año', fMilestoneTitle: 'Hito', fMilestoneDesc: 'Descripción',
    secStats: 'Cifras de portada', fStatValue: 'Cifra', fStatLabel: 'Texto de la cifra',
    fSessionLabel: 'Cómo se llama una sesión (videollamada, consulta, cita...)',
    adminReset: 'Restaurar contenido original',
    adminResetConfirm: '¿Restaurar todo el contenido a los valores originales? Se perderán tus cambios.',
    selectDateTime: 'Selecciona fecha y hora',
    photoPlaceholder: 'TU\nFOTO',
    reelPlay: 'Reanudar la secuencia', reelPause: 'Pausar la secuencia',
    footerNav: 'Enlaces del sitio', developedBy: 'Desarrollado por', adminEntry: 'Acceso del propietario',
    payMethods: ['Tarjeta', 'PayPal', 'Transferencia'],
    weekdays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  },
  en: {
    navInicio: 'Home', navAbout: 'About {name}', navServices: 'Services', navSocial: 'Social', navAgendar: 'Book',
    ctaAgendar: 'Book a {session}', ctaAgendarMi: 'Book my {session}', playVideo: 'Watch intro', scroll: 'SCROLL',
    videoPlaceholderTitle: 'Intro video', videoPlaceholderBody: 'Add your video URL in the Admin panel and it will play here.',
    whyKicker: 'WHY {name}', whyTitle: 'Personal attention, never generic formulas',
    servKicker: 'HOW I HELP', servTitle: 'Areas of work',
    servNotePre: 'Every session takes place in a', servNoteStrong: 'private {session}', servNotePost: ', out of respect for your privacy. One service, tailored to you.',
    verDetalle: 'See service details',
    aboutKicker: 'ABOUT ME', aboutTeaserTitle: 'Experience at your service',
    aboutTeaserBody: 'I accompany those seeking clarity and direction in the moments that define their path. Every session is an intimate space, free of judgment.',
    aboutTeaserBtn: 'Read my story',
    commKicker: 'COMMUNITY', commTitle: 'What past clients say', followMe: 'Follow me',
    finalTitle: 'Ready to take the next step?',
    aboutTitle: 'Who you will be talking to',
    aboutBody1: '{name} has spent years accompanying people who seek answers beyond the obvious, blending attentive listening with hard-earned experience.',
    aboutBody2: 'Every session is an intimate, personal space. {name} sees the work as illuminating the path each person already carries within — never imposing it.',
    trajTitle: 'Training & journey', aboutCtaTitle: 'Feel it is time to talk?',
    socialKicker: 'SOCIAL MEDIA', socialTitle: 'Follow me on the path', followers: 'followers', follow: 'Follow',
    recentContent: 'Recent content', testimonialsTitle: 'Testimonials',
    consKicker: 'THE SESSIONS', consTitle: 'One {session}, my full attention',
    consIntroPre: 'Out of respect for your privacy, every session takes place in a', consIntroStrong: 'private one-to-one {session}', consIntroPost: 'with {name}. Always one to one, never in a group.',
    privateCallLabel: 'PRIVATE {SESSION}', singlePayment: 'One-time, secure payment', bookNow: 'Book now', whatTogether: 'What we can explore together',
    bookKicker: 'BOOK A {SESSION}', bookTitle: 'Reserve your space',
    stepHorario: 'Time', stepDatos: 'Your info', stepPago: 'Payment',
    chooseDay: 'Choose a day', chooseTime: 'Choose a time', yourCall: 'YOUR {SESSION}',
    fullName: 'Full name', phName: 'Your name', phone: 'WhatsApp / Phone', emailLabel: 'Email (your details will arrive here)',
    notesLabel: 'Briefly, what brings you (optional)', phNotes: 'Write here...',
    totalToPay: 'TOTAL DUE', videocall: '{Session}', cardName: 'Name on card', phCardName: 'As shown on the card',
    cardNumber: 'Card number', expiry: 'Expiry', securePayment: 'Encrypted payment. We do not store your card details.',
    back: 'Back', continueBtn: 'Continue', pay: 'Pay',
    confTitle: 'Payment confirmed!', confSubtitle: 'Your {session} with {name} is booked.',
    nextSteps: 'NEXT STEPS',
    nextStep1: 'You will get the details of your {session} by email and WhatsApp.',
    nextStep2: 'I will send a reminder 1 day before.',
    nextStep3: 'Find a quiet space and come with an open mind.',
    share: 'Share', addCalendar: 'Add to calendar', backHome: 'Back to home',
    adminKicker: 'ADMIN PANEL', viewSite: 'View site', adminTitle: 'Edit the whole app',
    adminSubtitle: 'Changes apply instantly. Text is edited per language; use the selector below.',
    editingLang: 'Editing language:',
    secBrand: 'Brand & hero', fBrandName: 'Brand name', fProfessionalName: 'Name of who takes the sessions (shown site-wide)',
    fKicker: 'Top label', fHeroTitle: 'Main headline (Enter = line break)', fHeroSub: 'Subtitle',
    secVideoCall: '{Session} (paid product)', fPrice: 'Price', fDuration: 'Duration', fBackgroundVideoUrl: 'Hero background video (short, silent, loops)',
    fVideoUrl: 'Intro video (the one that opens when you press play)', fSlots: 'Available times (toggle on / off)',
    secAreas: 'Areas of work (informational)', secSocial: 'Social media', fIgHandle: 'Instagram — handle', fTtHandle: 'TikTok — handle', fFollowers: 'Followers',
    secTestimonials: 'Testimonials',
    secMilestones: 'Journey (timeline)', fYear: 'Year', fMilestoneTitle: 'Milestone', fMilestoneDesc: 'Description',
    secStats: 'Headline figures', fStatValue: 'Figure', fStatLabel: 'Figure caption',
    fSessionLabel: 'What a session is called (video call, consultation, appointment...)',
    adminReset: 'Reset to original content',
    adminResetConfirm: 'Reset all content to its original values? Your edits will be lost.',
    selectDateTime: 'Select date and time',
    photoPlaceholder: 'YOUR\nPHOTO',
    reelPlay: 'Resume the sequence', reelPause: 'Pause the sequence',
    footerNav: 'Site links', developedBy: 'Developed by', adminEntry: 'Owner access',
    payMethods: ['Card', 'PayPal', 'Transfer'],
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
}

const capitalize = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s)

/**
 * The localized UI strings with their placeholders resolved from site content.
 *
 * Call this instead of reading UI[lang] directly, or the placeholders leak to
 * the page verbatim. Arrays (weekdays, payMethods) pass through as-is; none of
 * them carry placeholders.
 *
 * Placeholders:
 *   {name}     content.professionalName — who takes the sessions
 *   {session}  content.t[lang].sessionLabel — what a session is called
 *
 * {session} comes in three cases because Spanish and English both need the
 * word mid-sentence ("Agendar {session}"), sentence-initial ("{Session} privada")
 * and in all-caps labels ("TU {SESSION}"). One token could not cover all three
 * without the buyer's own wording coming out miscapitalised.
 */
export function getUI(lang, content) {
  const strings = UI[lang] ?? UI.es
  // Falling back to the brand name keeps the copy readable if the buyer has
  // not filled the field in yet — better than rendering a literal "{name}".
  const name = content?.professionalName || content?.brandName || ''
  const session = content?.t?.[lang]?.sessionLabel || (lang === 'en' ? 'session' : 'sesión')

  const substitutions = [
    ['{name}', name],
    ['{SESSION}', session.toUpperCase()],
    ['{Session}', capitalize(session)],
    ['{session}', session],
  ]

  return Object.fromEntries(
    Object.entries(strings).map(([key, value]) => {
      if (typeof value !== 'string') return [key, value]
      const filled = substitutions.reduce(
        (acc, [token, replacement]) => acc.replaceAll(token, replacement),
        value,
      )
      return [key, filled]
    }),
  )
}

// MILESTONES and STATS used to live here. They are site content — the timeline
// and the headline figures differ for every buyer — so they moved into
// SiteContent under t[lang].milestones / t[lang].stats and are edited from
// Admin. Read them from `ct`, not from this module.
