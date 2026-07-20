// Thin client over the Django API. In dev, Vite proxies /api to :8000.

const BASE = '/api'
const TOKEN_KEY = 'gs_admin_token'

// sessionStorage, not localStorage: the admin token dies with the tab, which
// keeps the exposure window short. Hardening further means moving to an
// httpOnly cookie, which requires the API and site to share an origin.
export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  else sessionStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(status, data) {
    super(typeof data === 'string' ? data : data?.detail || 'Request failed')
    this.status = status
    this.data = data
  }

  /** First human-readable message out of a DRF error body. */
  get firstMessage() {
    const { data } = this
    if (typeof data === 'string') return data
    if (!data) return this.message
    if (data.detail) return data.detail
    const first = Object.values(data)[0]
    return Array.isArray(first) ? first[0] : String(first)
  }
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, { detail: 'No se pudo conectar con el servidor.' })
  }

  if (response.status === 204) return null

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) throw new ApiError(response.status, data)
  return data
}

export const api = {
  getContent: () => request('/content/'),
  putContent: (data) => request('/content/', { method: 'PUT', body: { data }, auth: true }),
  resetContent: () => request('/content/reset/', { method: 'POST', auth: true }),

  getAvailability: () => request('/availability/'),
  createBooking: (booking) => request('/bookings/', { method: 'POST', body: booking }),

  // No card data crosses this boundary — see BookingPayView on the server.
  payBooking: (reference) => request(`/bookings/${reference}/pay/`, { method: 'POST' }),

  listBookings: () => request('/bookings/all/', { auth: true }),

  async login(username, password) {
    const data = await request('/auth/token/', {
      method: 'POST',
      body: { username, password },
    })
    setToken(data.access)
    return data
  },

  logout: () => setToken(null),
}
