/**
 * Client configuration for the JalurKu maintenance dashboard.
 *
 * Values live ONLY in the browser's localStorage on this device. The default API base URL
 * can be seeded at build time via the Vite env var `VITE_API_BASE_URL`. No secret is ever
 * committed or sent anywhere except as a header to your own JalurKu API.
 *
 * @module api/config
 */

const KEY = 'jalurku.dashboard.config.v1'

const DEFAULTS = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  token: '', // guest session token (Authorization: Bearer)
  adminKey: '', // X-Admin-Key for admin endpoints
  consentVersion: import.meta.env.VITE_CONSENT_VERSION || '2026-10-13',
}

export function loadConfig() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveConfig(patch) {
  const next = { ...loadConfig(), ...patch }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}

export function clearCredentials() {
  const cfg = loadConfig()
  saveConfig({ ...cfg, token: '', adminKey: '' })
}

export function apiBase() {
  const { baseUrl } = loadConfig()
  return (baseUrl || '').replace(/\/+$/, '') + '/api/v1'
}
