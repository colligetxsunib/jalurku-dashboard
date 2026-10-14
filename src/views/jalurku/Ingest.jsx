/**
 * Ingest view: POST /admin/ingest.
 *
 * Payload is an array of rows (same columns as the seed CSV for the chosen type).
 * One type = one all-or-nothing transaction on the backend.
 *
 * @component
 */

import React, { useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CRow,
  CSpinner,
} from '@coreui/react'
import { api, ApiError } from 'src/api/client'
import { loadConfig } from 'src/api/config'
import ApiErrorAlert from 'src/components/ApiErrorAlert'

const TIPE = [
  { v: 'ketentuan', d: 'Ketentuan resmi SNPMB (batas pilihan, kuota, dsb.)' },
  { v: 'rules', d: 'Rule gate per jalur (syarat mutlak)' },
  { v: 'katalog', d: 'PTN & prodi (serta jalur dibuka)' },
  { v: 'acuan', d: 'Acuan skor SNBT per prodi' },
  { v: 'dokumen', d: 'Metadata dokumen sumber RAG' },
  { v: 'profesi', d: 'Contoh profesi per rumpun' },
]

const CONTOH = {
  profesi: [{ rumpun: 'Hukum', nama: 'Notaris', deskripsi: 'Pejabat umum pembuat akta otentik' }],
}

const Ingest = () => {
  const cfg = loadConfig()
  const [tipe, setTipe] = useState('profesi')
  const [payload, setPayload] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const fillExample = () => setPayload(JSON.stringify(CONTOH[tipe] || [{}], null, 2))

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    let parsed
    try {
      parsed = JSON.parse(payload || '[]')
    } catch (err) {
      setError(new ApiError(0, 'json_tidak_valid', 'Payload bukan JSON valid: ' + err.message))
      return
    }
    if (!Array.isArray(parsed)) {
      setError(new ApiError(0, 'bukan_array', 'Payload harus berupa array (JSON list).'))
      return
    }
    setBusy(true)
    try {
      const r = await api.ingest(tipe, parsed)
      setResult(r)
    } catch (err) {
      setError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {!cfg.adminKey && (
        <CAlert color="warning">
          X-Admin-Key belum diisi. Buka <a href="#/jalurku/settings">Pengaturan</a> untuk mengisinya,
          atau endpoint ini akan 401/404.
        </CAlert>
      )}
      <CRow>
        <CCol lg={7}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Kirim batch</strong>
            </CCardHeader>
            <CForm onSubmit={onSubmit}>
              <CCardBody>
                <div className="mb-3">
                  <CFormLabel>Tipe data</CFormLabel>
                  <CFormSelect value={tipe} onChange={(e) => setTipe(e.target.value)}>
                    {TIPE.map((t) => (
                      <option key={t.v} value={t.v}>
                        {t.v} — {t.d}
                      </option>
                    ))}
                  </CFormSelect>
                </div>
                <div className="mb-2 d-flex justify-content-between align-items-center">
                  <CFormLabel className="mb-0">Payload (JSON array)</CFormLabel>
                  <CButton size="sm" color="secondary" variant="ghost" type="button" onClick={fillExample}>
                    Isi contoh
                  </CButton>
                </div>
                <CFormTextarea
                  rows={14}
                  className="font-monospace"
                  spellCheck={false}
                  value={payload}
                  onChange={(e) => setPayload(e.target.value)}
                  placeholder='[ { "kolom": "nilai" } ]'
                />
                <small className="text-body-secondary">
                  Setiap elemen = satu baris, kolomnya sama seperti berkas CSV seed untuk tipe tsb.
                </small>
              </CCardBody>
              <CCardFooter className="text-end">
                <CButton color="primary" type="submit" disabled={busy}>
                  {busy ? <CSpinner size="sm" /> : 'Impor'}
                </CButton>
              </CCardFooter>
            </CForm>
          </CCard>
        </CCol>
        <CCol lg={5}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Hasil</strong>
            </CCardHeader>
            <CCardBody>
              {error && (
                <>
                  <ApiErrorAlert error={error} />
                  {error instanceof ApiError && (error.status === 401 || error.status === 404) && (
                    <div className="text-body-secondary small">
                      Cek X-Admin-Key di <a href="#/jalurku/settings">Pengaturan</a>. Backend
                      mengembalikan 404 bila <code>ADMIN_KEY</code> tidak diset di server.
                    </div>
                  )}
                </>
              )}
              {result && (
                <>
                  <CAlert color="success">
                    Diterima {result.diterima} baris (tipe {result.tipe}).
                  </CAlert>
                  <pre className="p-2 bg-body-tertiary rounded small" style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </>
              )}
              {!result && !error && <div className="text-body-secondary py-4 text-center">Belum ada impor.</div>}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Ingest
