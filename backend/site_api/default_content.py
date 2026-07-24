"""Seed content for a fresh install.

This is a template that gets sold and re-skinned repeatedly, so the seed must
name no real business, person or sector: it is placeholder copy that each buyer
replaces from the Admin screen. Keep it that way — anything specific written
here ends up on every new install until someone notices.

Once the site is running, everything here lives in the SiteContent row and is
editable from Admin. This module is only the starting point, and the target of
"reset to original".
"""

DEFAULT_CONTENT = {
    'brandName': 'TU MARCA',
    # Substituted into the UI copy wherever {name} appears — see getUI() in
    # frontend/src/i18n.js. Editable from Admin, so no rebuild per customer.
    'professionalName': 'Nombre Apellido',
    'videoPrice': '$60 USD',
    'videoDuration': '50 min',
    # Two videos, two jobs — they want opposite things:
    #   backgroundVideoUrl  the hero backdrop. Short, silent, loops, never has
    #                       controls. Ships with the template.
    #   videoUrl            the owner's actual intro, opened by "play". Has a
    #                       voice and controls, and is as long as it needs to be.
    # The relative path is deliberate: WhiteNoise serves frontend/dist at the
    # site root, so /hero.mp4 resolves in development and in production without
    # anyone configuring a domain or a CDN.
    'backgroundVideoUrl': '/hero.mp4',
    'videoUrl': '',
    'igHandle': '@tumarca',
    'igFollowers': '24.5K',
    'ttHandle': '@tumarca',
    'ttFollowers': '41.2K',
    # Part of the palette lives here rather than in CSS, because the owner can
    # restyle these from Admin. Consequence worth knowing: changing the CSS
    # tokens does NOT restyle an existing site — backfill only adds missing
    # keys, it never overwrites. An already-live install needs "reset content"
    # or a manual edit to pick these up.
    'cardBgs': [
        'linear-gradient(150deg,#4f46e5,#2a1f9e)',
        'linear-gradient(150deg,#e5484d,#8f1d24)',
        'linear-gradient(150deg,#22d3ee,#0e7490)',
        'linear-gradient(150deg,#f5b944,#a9660d)',
    ],
    'avatarBgs': [
        'linear-gradient(135deg,#4f46e5,#6d64f0)',
        'linear-gradient(135deg,#22d3ee,#3b82f6)',
        'linear-gradient(135deg,#f5b944,#ffd37c)',
    ],
    'slots': [
        {'value': '9:00', 'enabled': True},
        {'value': '10:30', 'enabled': True},
        {'value': '12:00', 'enabled': True},
        {'value': '15:00', 'enabled': True},
        {'value': '16:30', 'enabled': True},
        {'value': '18:00', 'enabled': True},
    ],
    't': {
        'es': {
            # Substituted into the UI wherever {session} appears, in three
            # cases (see getUI in i18n.js). Write it lowercase and singular.
            'sessionLabel': 'videollamada',
            'heroKicker': 'SESIONES PRIVADAS · POR VIDEOLLAMADA',
            'heroTitle': 'Tu camino\ntiene guía',
            # Se turnan sobre el video del hero. Son una secuencia real
            # (reconocer -> imaginar -> decidir), y por eso los marcadores de
            # progreso significan algo en lugar de decorar.
            'heroPhrases': [
                'Tu camino tiene guía',
                'Una hora, solo para ti',
                'Reserva cuando estés listo',
            ],
            'heroSubtitle': (
                'Sesiones personales, uno a uno. Reserva tu espacio y hablemos '
                'con calma en una videollamada privada, solo para ti.'
            ),
            'services': [
                {'title': 'Primer servicio', 'desc': 'Describe aquí en qué consiste y a quién va dirigido.'},
                {'title': 'Segundo servicio', 'desc': 'Un par de líneas bastan: qué incluye y qué se lleva la persona.'},
                {'title': 'Tercer servicio', 'desc': 'Explica el acompañamiento que ofreces y en qué momentos ayuda.'},
                {'title': 'Cuarto servicio', 'desc': 'Cierra con el servicio que mejor te distinga de los demás.'},
            ],
            'testimonials': [
                {'name': 'María G.', 'quote': 'Sustituye este texto por un testimonio real de alguien a quien hayas atendido.'},
                {'name': 'Carlos R.', 'quote': 'Los testimonios concretos convencen más que los elogios genéricos.'},
                {'name': 'Ana L.', 'quote': 'Pide permiso antes de publicar el nombre de un cliente.'},
            ],
            'milestones': [
                {'year': '2013', 'title': 'Los primeros pasos', 'desc': 'La formación que dio forma a todo lo demás.'},
                {'year': '2016', 'title': 'Primeras sesiones privadas', 'desc': 'Empieza a atender a su comunidad cercana.'},
                {'year': '2020', 'title': 'Sesiones por videollamada', 'desc': 'Lleva su labor a un formato privado y remoto.'},
                {'year': '2024', 'title': 'Comunidad digital', 'desc': 'Su trabajo llega a miles de personas por redes.'},
            ],
            # 'color' is a design token, not copy: Admin lets the owner edit the
            # figure and its label, and leaves the colour alone.
            'stats': [
                {'value': '10+', 'label': 'años de experiencia', 'color': '#e5484d'},
                {'value': '1 a 1', 'label': 'sesiones privadas, sin salas grupales', 'color': '#4f46e5'},
                {'value': '65K+', 'label': 'personas en la comunidad', 'color': '#f5b944'},
            ],
        },
        'en': {
            'sessionLabel': 'video call',
            'heroKicker': 'PRIVATE SESSIONS · BY VIDEO CALL',
            'heroTitle': 'Your path\nhas a guide',
            'heroPhrases': [
                'Your path has a guide',
                'One hour, only yours',
                'Book when you are ready',
            ],
            'heroSubtitle': (
                'Personal one-to-one sessions. Book your slot and let us talk '
                'unhurried, in a private video call meant only for you.'
            ),
            'services': [
                {'title': 'First service', 'desc': 'Describe what it involves and who it is for.'},
                {'title': 'Second service', 'desc': 'A couple of lines is enough: what it includes and what they take away.'},
                {'title': 'Third service', 'desc': 'Explain the support you offer and when it helps most.'},
                {'title': 'Fourth service', 'desc': 'Close with whatever sets you apart from everyone else.'},
            ],
            'testimonials': [
                {'name': 'María G.', 'quote': 'Replace this with a real testimonial from someone you have worked with.'},
                {'name': 'Carlos R.', 'quote': 'Specific testimonials persuade far better than generic praise.'},
                {'name': 'Ana L.', 'quote': 'Ask permission before publishing a client name.'},
            ],
            'milestones': [
                {'year': '2013', 'title': 'The first steps', 'desc': 'The training that shaped everything else.'},
                {'year': '2016', 'title': 'First private sessions', 'desc': 'Starts working with a close community.'},
                {'year': '2020', 'title': 'Video-call sessions', 'desc': 'Moves the work to a private, remote format.'},
                {'year': '2024', 'title': 'Digital community', 'desc': 'The work reaches thousands through social media.'},
            ],
            'stats': [
                {'value': '10+', 'label': 'years of experience', 'color': '#e5484d'},
                {'value': '1-on-1', 'label': 'private sessions, never group rooms', 'color': '#4f46e5'},
                {'value': '65K+', 'label': 'people in the community', 'color': '#f5b944'},
            ],
        },
    },
}

LANGUAGES = ('es', 'en')
