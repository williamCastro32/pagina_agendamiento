# booking-site

Plantilla de web para profesionales que atienden por videollamada: reserva de
horario, pago, portada en dos idiomas (ES/EN) y panel de administración para
editar todo el contenido.

```
backend/    Django 5 + DRF — contenido, disponibilidad, reservas, auth JWT
frontend/   Vite + React   — las 7 pantallas
```

## Es una plantilla que se revende

Nada en el código nombra a un negocio, persona o sector concreto. Cada instalación
se personaliza **desde la pantalla Admin, sin tocar código ni recompilar**.

Al montar un sitio nuevo, lo mínimo a cambiar en Admin es `brandName`,
`professionalName`, los handles de redes, el precio y los horarios.

> **Regla al editar**: si escribes algo específico de un cliente en
> `default_content.py` o en `i18n.js`, aparecerá en **todas** las instalaciones
> futuras. Lo específico va en Admin; en el código solo van marcadores.

## Puesta en marcha

Se usa el entorno virtual compartido de `proyectos/.venv`.

**Backend** (puerto 8000):

```bash
../.venv/Scripts/python backend/manage.py migrate
../.venv/Scripts/python backend/manage.py createsuperuser   # para entrar al panel Admin
../.venv/Scripts/python backend/manage.py runserver
```

**Frontend** (puerto 5173):

```bash
cd frontend
npm install     # solo la primera vez
npm run dev
```

Abre <http://localhost:5173>. Vite hace de proxy de `/api` hacia Django, así que
en desarrollo todo viaja por un mismo origen y CORS no interviene.

## Pantallas

| Pantalla | Qué hace |
|---|---|
| Home | Portada, estadísticas, áreas de trabajo, testimonios, CTA |
| Sobre mí | Biografía y línea de tiempo |
| Servicios | Detalle del servicio y precio |
| Redes | Instagram / TikTok y testimonios |
| Agendar | Asistente de 3 pasos: horario → datos → pago |
| Confirmación | Resumen de la reserva y referencia |
| Admin | Edita el contenido del sitio (requiere login) |

## API

| Método | Ruta | Permiso |
|---|---|---|
| GET | `/api/content/` | público |
| PUT | `/api/content/` | admin |
| POST | `/api/content/reset/` | admin |
| GET | `/api/availability/` | público |
| POST | `/api/bookings/` | público (60/h por IP) |
| POST | `/api/bookings/<ref>/pay/` | público |
| GET | `/api/bookings/all/` | admin |
| POST | `/api/auth/token/` | público |

El precio y la duración de una reserva los fija **el servidor** a partir del
contenido actual; el cliente no puede dictarlos. Quedan congelados en la reserva
para que un cambio posterior de precio no reescriba el historial.

### Reserva de horarios

Una reserva `pending` bloquea su hueco durante 15 minutos (`PENDING_HOLD` en
`backend/site_api/models.py`); si no se paga, el hueco vuelve a ofrecerse. Una
reserva `paid` lo bloquea de forma definitiva, con una restricción única en base
de datos que impide dos pagos sobre el mismo hueco.

## El pago NO es real

`/api/bookings/<ref>/pay/` sólo marca la reserva como pagada. **No cobra nada.**

El formulario de tarjeta es de la maqueta original: sus datos se quedan en el
navegador y no se envían ni se guardan en ningún sitio — a propósito, porque
recibir números de tarjeta en un servidor propio implica cumplimiento PCI DSS.

Para aceptar pagos de verdad:

1. Integra Stripe Elements (o equivalente) en el paso 3 — la tarjeta va del
   navegador directo a Stripe, nunca a este backend.
2. Crea el PaymentIntent desde Django y confirma la reserva **desde el webhook**,
   no desde la respuesta del navegador.
3. Sustituye `BookingPayView` por ese manejador de webhook.

## Despliegue (Railway)

Guía completa en `GUIA.doc`. En resumen: **un solo servicio**, donde Django sirve
la API y también la SPA compilada. `api.js` llama a `/api` con ruta relativa, así
que un único origen lo mantiene funcionando sin tocar el frontend, y CORS no
interviene.

```
Dockerfile      dos etapas — Node compila frontend/dist, Python monta la imagen
railway.json    builder DOCKERFILE, healthcheck en /api/content/
```

El arranque (`migrate` + `gunicorn`) está en la última línea del `Dockerfile`.
**No hay `Procfile`**: Railway lo ignora cuando existe un `Dockerfile`, y un
fichero que aparenta mandar sin mandar es una trampa.

Pasos:

1. `git init && git add . && git commit -m "..."` — la carpeta aún no es un repo.
2. Railway → *Deploy from GitHub repo*. El primer build falla: falta la BD.
3. *New* → *Database* → *Add PostgreSQL*. Define `DATABASE_URL`.
4. Variables del servicio: `SECRET_KEY` (nueva, distinta de la local), `DEBUG=False`,
   `TIME_ZONE`, y `DJANGO_SUPERUSER_USERNAME` / `_PASSWORD` / `_EMAIL`.
5. *Settings* → *Generate Domain*, puerto 8000. `settings.py` lo lee de
   `RAILWAY_PUBLIC_DOMAIN` y lo añade solo a `ALLOWED_HOSTS` y `CSRF_TRUSTED_ORIGINS`.

El admin del servidor lo crea `ensure_superuser` (comando propio en `site_api`) en
cada arranque, leyendo esas variables: lo crea si no existe y no hace nada si ya
está. Sustituye al `createsuperuser` interactivo, que exigiría el CLI de Railway —
y ese CLI está bloqueado en esta máquina por Smart App Control (binario sin firmar;
Scoop no lo esquiva porque descarga el mismo binario). Borra
`DJANGO_SUPERUSER_PASSWORD` de las variables una vez comprobado el acceso.

Sin `DATABASE_URL` se cae a SQLite, y el disco de Railway es efímero — las
reservas se perderían en cada redespliegue.

### Pendiente

- El token de admin se guarda en `sessionStorage`, así que muere al cerrar la
  pestaña. Ahora que API y web comparten dominio, una cookie `httpOnly` sería más
  resistente a XSS.
- Envío de correo y WhatsApp: la pantalla de confirmación los promete, pero aún
  no hay nada que los mande.

## Tests

```bash
../.venv/Scripts/python backend/manage.py test site_api
```

25 tests cubren contenido, permisos, disponibilidad, el relleno de claves nuevas
en instalaciones ya desplegadas, y las condiciones de carrera de la reserva
(huecos expirados, doble pago, pago sobre hueco ya ocupado).

## Dónde vive cada texto

Equivocarse de sitio es la forma más común de editar el fichero incorrecto:

| Dónde | Qué | Lo cambia |
|---|---|---|
| `SiteContent.data` (una fila JSON) | marca, nombre profesional, cómo se llama una sesión, portada, servicios, testimonios, trayectoria, cifras, precio, handles, horarios | el dueño del sitio, desde Admin |
| `backend/site_api/default_content.py` | la semilla de esa fila, y el destino de «restaurar» | desarrollo |
| `frontend/src/i18n.js` | botones, etiquetas, días de la semana | desarrollo |

### Los marcadores de `i18n.js`

Hay cosas que aparecen por toda la interfaz y cambian en cada venta. En `i18n.js`
se escriben como marcadores, y `getUI(lang, content)` los resuelve al renderizar:

| Marcador | Sale de | Ejemplo |
|---|---|---|
| `{name}` | `content.professionalName` | `'Sobre {name}'` → «Sobre Ana Ruiz» |
| `{session}` | `content.t[lang].sessionLabel` | `'Agendar {session}'` → «Agendar videollamada» |
| `{Session}` | igual, capitalizado | `'{Session} privada'` → «Videollamada privada» |
| `{SESSION}` | igual, en mayúsculas | `'TU {SESSION}'` → «TU VIDEOLLAMADA» |

`{session}` tiene tres formas porque la palabra aparece a mitad de frase,
al principio y en etiquetas en mayúsculas. Con un solo marcador, la palabra que
escriba el comprador saldría mal capitalizada en un tercio de los sitios.

Consecuencia práctica: **una venta nueva no requiere tocar código**. Quien compra
pone su nombre y cómo llama a sus sesiones («videollamada», «consulta»,
«cita»...) y toda la web se adapta.

> `getUI()` es el único punto donde se resuelven. No leas `UI[lang]` directamente
> desde un componente, o los marcadores acabarán impresos tal cual en la página.

Si escribes una cadena nueva que mencione la modalidad, evita además dar por
supuesto que es remota: «recibirás el *enlace*» o «sin *grabaciones*» no valen
para alguien que atiende presencialmente. Esas frases ya están redactadas de
forma neutra.

### Añadir una clave de contenido nueva

1. Añádela a `DEFAULT_CONTENT`.
2. Valídala en `SiteContentSerializer.validate_data` si es obligatoria.
3. Añade su campo en `screens/Admin.jsx`.

`SiteContent.load()` rellena las claves que falten (`backfill_defaults`), tanto de
primer nivel como dentro de cada idioma, así que las instalaciones ya desplegadas
reciben la clave nueva sin perder el contenido que su dueño hubiera editado.

Rellena solo claves **ausentes**, nunca valores existentes: un dueño que vació un
campo lo mantiene vacío. Ausente significa «se añadió después de escribirse esta
fila»; vacío significa «lo borré a propósito».
