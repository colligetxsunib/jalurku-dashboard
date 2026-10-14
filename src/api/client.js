/**
 * Fetch wrapper for the JalurKu API.
 *
 * Handles base URL, auth headers (Bearer token / X-Admin-Key), and the backend's uniform
 * error envelope: {"error": {"kode", "pesan", "detail"}}. All methods return parsed JSON or
 * throw an {@link ApiError}.
 *
 * @module api/client
 */

import { apiBase, loadConfig } from './config'

/** Error carrying the backend's error code, HTTP status, and validation detail. */
export class ApiError extends Error {
  constructor(status, kode, pesan, detail) {
    super(pesan || `HTTP ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.kode = kode || 'kesalahan'
    this.detail = detail || {}
  }
}

async function request(method, path, { body, auth = 'bearer', formData, query } = {}) {
  const cfg = loadConfig()
  let url = apiBase() + path
  if (query) {
    const qs = new URLSearchParams(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    )
    if ([...qs].length) url += '?' + qs.toString()
  }

  const headers = {}
  if (auth === 'bearer' && cfg.token) headers['Authorization'] = `Bearer ${cfg.token}`
  if (auth === 'admin' && cfg.adminKey) headers['X-Admin-Key'] = cfg.adminKey

  let payload
  if (formData) {
    payload = formData // let the browser set the multipart Content-Type
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let resp
  try {
    resp = await fetch(url, { method, headers, body: payload })
  } catch {
    throw new ApiError(0, 'jaringan', `Tidak bisa menjangkau API di ${apiBase()}. Cek Base URL & CORS.`)
  }

  if (resp.status === 204) return null

  const text = await resp.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }
  }

  if (!resp.ok) {
    const err = (data && data.error) || {}
    throw new ApiError(resp.status, err.kode, err.pesan || `HTTP ${resp.status}`, err.detail)
  }
  return data
}

export const api = {
  get: (p, opts) => request('GET', p, opts),
  post: (p, body, opts) => request('POST', p, { body, ...opts }),

  // --- specific endpoints ---
  health: () => request('GET', '/health', { auth: 'none' }),
  createSession: (consentVersion) =>
    request('POST', '/session', {
      auth: 'none',
      body: { consent: true, consent_version: consentVersion },
    }),
  riasecQuestions: () => request('GET', '/riasec/questions', { auth: 'none' }),
  riasecSubmit: (jawaban, simpan) => request('POST', '/riasec/submit', { body: { jawaban, simpan } }),
  ingest: (tipe, payload) => request('POST', '/admin/ingest', { body: { tipe, payload }, auth: 'admin' }),
  uploadDoc: (dokumenId, file, proses) => {
    const fd = new FormData()
    fd.append('berkas', file)
    return request('POST', `/admin/dokumen/${encodeURIComponent(dokumenId)}/berkas`, {
      auth: 'admin',
      formData: fd,
      query: { proses: String(!!proses) },
    })
  },
  listPtn: (params) => request('GET', '/catalog/ptn', { query: params }),
  listProdi: (params) => request('GET', '/catalog/prodi', { query: params }),
  detailProdi: (id) => request('GET', `/catalog/prodi/${encodeURIComponent(id)}`),
}
