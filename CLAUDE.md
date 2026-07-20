# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

Python runs from the **shared venv one level up**, not a per-project one:
`C:\Users\William\Desktop\proyectos\.venv`. Invoke it directly rather than activating it.
It already carries Django, DRF, SimpleJWT, corsheaders and python-decouple.

The venv covers Python only — the frontend's React/Vite come from npm and are unrelated to it.

`backend/requirements.txt` is the base — it includes `dj-database-url` and `whitenoise` because
`settings.py` imports them unconditionally, so they are needed locally too.
`backend/requirements-prod.txt` adds `gunicorn` and `psycopg2-binary` on top and is what the
`Dockerfile` installs.

## Commands

```bash
# Backend (port 8000)
../.venv/Scripts/python backend/manage.py runserver
../.venv/Scripts/python backend/manage.py migrate
../.venv/Scripts/python backend/manage.py createsuperuser   # needed to log into the Admin screen

# Tests — all, one class, one case
../.venv/Scripts/python backend/manage.py test site_api
../.venv/Scripts/python backend/manage.py test site_api.tests.BookingTests
../.venv/Scripts/python backend/manage.py test site_api.tests.BookingTests.test_payment_marks_booking_paid

# Frontend (port 5173)
npm run dev   --prefix frontend
npm run build --prefix frontend      # the only frontend check that exists
```

There is no linter and no frontend test suite. `npm run build` is what catches frontend breakage.

Run both servers together: Vite proxies `/api` to `127.0.0.1:8000` (`frontend/vite.config.js`),
so the browser sees one origin and CORS never engages in development. The `CORS_ALLOWED_ORIGINS`
setting only matters in production, where the two are deployed separately.

## Architecture

Ported from a Claude Design file; the original was a single React-like component, and screens map
to `frontend/src/screens/*.jsx`.

### This is a template that gets resold

The same codebase is sold and re-skinned for many customers. **No file may name a real business,
person, or sector** — not `default_content.py`, not `i18n.js`, not the docs. Anything specific
written into code ships to every future install; anything specific belongs in `SiteContent`, which
the buyer edits from Admin.

### Text lives in three different places

Getting this wrong is the most common way to edit the wrong file:

| Where | What | Editable by |
|---|---|---|
| `frontend/src/i18n.js` | UI chrome — button labels, form labels, weekday names | developers only |
| `SiteContent.data` (one JSON row) | brand, professional name, session label, hero copy, services, testimonials, timeline, stats, price, handles, time slots | site owner, via Admin screen |
| `backend/site_api/default_content.py` | the seed for that row, and the target of "reset to original" | developers only |

`SiteContent` is a singleton — `save()` pins `id = 1`, and `load()` seeds from `DEFAULT_CONTENT`
on first access. Bilingual content is nested under `data['t']['es' | 'en']`; UI strings are keyed
the same way in `i18n.js`.

`SiteContentSerializer.validate_data` structurally validates the whole JSON blob on write, so
adding a required content key means updating that validator too.

`load()` also calls `backfill_defaults()`, which adds keys the stored row predates — top level and
inside each `t[lang]`. Without it, adding a key to `DEFAULT_CONTENT` would only reach fresh
installs and every deployed site would render undefined until its owner hit "reset" and lost their
content.

It fills **absent keys only, never existing values**. That distinction is what makes recursing
into `t` safe: absent means "shipped after this row was written", while a field the owner cleared
is still present holding `''` or `[]`.

### Placeholders in `i18n.js` — resolved, never read raw

Two things vary per customer and appear across the whole UI, so they live in content and are
written as literal placeholders in `i18n.js`:

| Placeholder | Source |
|---|---|
| `{name}` | `content.professionalName` |
| `{session}` / `{Session}` / `{SESSION}` | `content.t[lang].sessionLabel`, lower / capitalised / upper |

`{session}` has three cases because the word lands mid-sentence, sentence-initial, and in all-caps
labels. A single token would miscapitalise the buyer's own wording in a third of its uses.

`getUI(lang, content)` performs the substitution and `App.jsx` is its only caller — **never read
`UI[lang]` directly from a component**, or the placeholders reach the page verbatim. `getUI` is
called below the `content` guards because it needs content; moving it back up reintroduces a null
deref.

Copy must also not assume the session is remote. Phrasing like "you'll get the *link*" or "no
*recordings*" breaks for a buyer who works in person, and no token can fix it — those sentences
are deliberately worded neutrally ("you'll get the details of your {session}").

### Slot reservation

Availability is derived, never stored. Three pieces must be read together:

- `Booking.blocking()` (models) — the queryset of bookings that currently occupy a slot
- `PENDING_HOLD` (models, 15 min) — an unpaid booking holds its slot only this long, then the
  slot is offered again
- `unique_paid_slot` constraint — a partial unique index on `(date, time)` where `status='paid'`,
  the last line of defence against double-booking

`AvailabilityView` and `BookingCreateSerializer.validate` both build on `blocking()`. Changing the
hold semantics means touching all of these.

The frontend creates the booking when the user leaves step 2 (so the slot is held while they type
card details) and confirms it at step 3. `Booking.jsx` keeps a `signature` of the form fields so
stepping back and forward reuses the existing pending booking instead of creating duplicates.

### Money

`price` and `duration` are set **server-side** in `BookingCreateSerializer.validate` from current
content, then snapshotted onto the row. A client-supplied price is ignored (there's a test for it),
and a later price change in Admin does not rewrite past bookings.

**Payment is a mock.** `BookingPayView` flips status to `paid` and charges nothing. The card form in
step 3 is presentation only: those values never leave the browser and no endpoint accepts them. This
is deliberate — accepting card numbers on this server would pull it into PCI DSS scope. Replacing it
means Stripe Elements client-side plus a webhook handler, not extending the current endpoint.

### Auth

DRF defaults to `IsAuthenticated`; public endpoints opt out with explicit `AllowAny`. Content writes
and the booking list require `IsAdminUser`. The frontend keeps its JWT in `sessionStorage`
(`frontend/src/api.js`) so it dies with the tab; a 401/403 on save drops the Admin screen back to its
login form.

### Frontend routing

There is no router. `App.jsx` holds `screen` in state and renders one of seven screens — so screens
have no URLs and no browser history. `DARK_SCREENS` decides whether the nav renders in its dark or
light treatment.

Styling is CSS classes and tokens in `frontend/src/index.css` (ported from the design's inline
styles); inline `style` is reserved for values that come from content, like gradient swatches.

### Deployment differs from development in shape, not just config

Development is two servers (Vite 5173 proxying `/api` to Django 8000). Production is **one**:
Django serves the API *and* the built SPA, so `api.js`'s relative `/api` base keeps working and
CORS stays out of the picture.

- `Dockerfile` — stage 1 (Node) builds `frontend/dist`, stage 2 (Python) installs
  `requirements-prod.txt` and copies that `dist` in. `collectstatic` runs at build time;
  `migrate` runs at container start, because there is no database during the build.
- `WHITENOISE_ROOT` serves `frontend/dist` at `/` (so the hashed `/assets/…` paths in `index.html`
  resolve), while `STATIC_ROOT` serves Django's own admin assets under `/static/`. Two separate
  trees on purpose. `staticfiles` storage is `CompressedStaticFilesStorage`, not the Manifest
  variant — that one raises on any asset missing from the manifest, and the SPA's files are not
  in it.
- `RAILWAY_PUBLIC_DOMAIN` is appended to `ALLOWED_HOSTS` and `CSRF_TRUSTED_ORIGINS` at import
  time, so a fresh deploy answers on its generated domain with no manual config.
- `ensure_superuser` (`site_api/management/commands/`) runs on every container start and creates
  the admin from `DJANGO_SUPERUSER_*` env vars. It exists because `createsuperuser` is interactive
  and its `--noinput` mode *errors* when the user already exists, which would crash every restart
  after the first. Idempotent on purpose — do not "simplify" it back to `createsuperuser`.
- **There is no `Procfile`.** Railway ignores it whenever a `Dockerfile` is present; the real
  start command is the `CMD` at the end of the `Dockerfile`. Adding one back would create a file
  that looks authoritative and silently is not.

## Gotchas

- The Django app is named `site_api`, not `api` — `startapp api` fails because an `api` module
  already exists in the shared venv's site-packages.
- Do not pre-create an app directory before `startapp`: an empty directory is an importable
  namespace package, and Django rejects the name as a conflict.
- `SECRET_KEY` must be at least 32 bytes — SimpleJWT signs with HS256 off it and warns below that.
