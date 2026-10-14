/**
 * Documents view: POST /admin/dokumen/{id}/berkas (multipart PDF upload).
 *
 * Optionally processes (chunk + embed) immediately. The document id must already be
 * registered via the "dokumen" ingest type.
 *
 * @component
 */

import React, { useRef, useState } from 'react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CRow,
  CSpinner,
} from '@coreui/react'
import { api, ApiError } from 'src/api/client'
import { loadConfig } from 'src/api/config'
import ApiErrorAlert from 'src/components/ApiErrorAlert'

const Documents = () => {
  const cfg = loadConfig()
  const [dokumenId, setDokumenId] = useState('')
  const [proses, setProses] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    const id = dokumenId.trim()
    const file = fileRef.current?.files?.[0]
    if (!id) return setError(new ApiError(0, 'validasi', 'Isi dokumen_id.'))
    if (!file) return setError(new ApiError(0, 'validasi', 'Pilih berkas PDF.'))
    setBusy(true)
    try {
      const r = await api.uploadDoc(id, file, proses)
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
          X-Admin-Key belum diisi. Buka <a href="#/jalurku/settings">Pengaturan</a> dulu.
        </CAlert>
      )}
      <CRow>
        <CCol lg={7}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Unggah PDF</strong>
            </CCardHeader>
            <CForm onSubmit={onSubmit}>
              <CCardBody>
                <div className="mb-3">
                  <CFormLabel>dokumen_id</CFormLabel>
                  <CFormInput
                    value={dokumenId}
                    onChange={(e) => setDokumenId(e.target.value)}
                    placeholder="mis. snpmb-paparan-2026"
                  />
                  <small className="text-body-secondary">
                    Harus sudah terdaftar lewat ingest tipe <code>dokumen</code>.
                  </small>
                </div>
                <div className="mb-3">
                  <CFormLabel>Berkas PDF</CFormLabel>
                  <CFormInput type="file" accept="application/pdf" ref={fileRef} />
                  <small className="text-body-secondary">Maks 30 MB, harus PDF asli (header %PDF-).</small>
                </div>
                <CFormCheck
                  id="proses"
                  label="Langsung proses (chunk + embed) — memakai kuota embedding"
                  checked={proses}
                  onChange={(e) => setProses(e.target.checked)}
                />
              </CCardBody>
              <CCardFooter className="text-end">
                <CButton color="primary" type="submit" disabled={busy}>
                  {busy ? <CSpinner size="sm" /> : 'Unggah'}
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
                  {error instanceof ApiError && error.status === 404 && (
                    <div className="text-body-secondary small">
                      dokumen_id belum terdaftar. Daftarkan lewat <a href="#/jalurku/ingest">Ingest Data</a>{' '}
                      tipe <code>dokumen</code> dulu.
                    </div>
                  )}
                </>
              )}
              {result && (
                <>
                  <CAlert color="success">
                    Berkas diterima: {result.berkas} ({result.ukuran_byte} byte).
                  </CAlert>
                  <pre className="p-2 bg-body-tertiary rounded small" style={{ whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </>
              )}
              {!result && !error && (
                <div className="text-body-secondary py-4 text-center">Belum ada unggahan.</div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Documents
