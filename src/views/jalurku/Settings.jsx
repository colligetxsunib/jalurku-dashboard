/**
 * Settings view
 *
 * Configure the connection to the JalurKu API: base URL, guest session token
 * (auto-created), and X-Admin-Key. Credentials are stored only in this device's
 * localStorage and are never committed.
 *
 * @component
 */

import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CRow,
  CSpinner,
} from '@coreui/react'
import { api, ApiError } from 'src/api/client'
import { loadConfig, saveConfig, clearCredentials } from 'src/api/config'

const Settings = () => {
  const [cfg, setCfg] = useState(loadConfig())
  const [health, setHealth] = useState(null) // null | 'checking' | 'ok' | string(error)
  const [creatingSession, setCreatingSession] = useState(false)
  const [notice, setNotice] = useState('')

  const update = (patch) => setCfg((c) => ({ ...c, ...patch }))

  const onSave = (e) => {
    e.preventDefault()
    saveConfig({
      baseUrl: cfg.baseUrl.trim(),
      consentVersion: cfg.consentVersion.trim(),
      token: cfg.token.trim(),
      adminKey: cfg.adminKey.trim(),
    })
    setNotice('Pengaturan disimpan.')
    setTimeout(() => setNotice(''), 2500)
  }

  const onForget = () => {
    clearCredentials()
    update({ token: '', adminKey: '' })
    setNotice('Token & admin key dihapus.')
    setTimeout(() => setNotice(''), 2500)
  }

  const onCreateSession = async () => {
    saveConfig({ baseUrl: cfg.baseUrl.trim(), consentVersion: cfg.consentVersion.trim() })
    setCreatingSession(true)
    try {
      const r = await api.createSession(cfg.consentVersion.trim())
      update({ token: r.token })
      saveConfig({ token: r.token })
      setNotice('Sesi tamu dibuat.')
    } catch (e) {
      setNotice(e instanceof ApiError ? `${e.kode}: ${e.message}` : e.message)
    } finally {
      setCreatingSession(false)
      setTimeout(() => setNotice(''), 3000)
    }
  }

  const onHealth = async () => {
    saveConfig({ baseUrl: cfg.baseUrl.trim() })
    setHealth('checking')
    try {
      const r = await api.health()
      setHealth(r.status === 'ok' ? 'ok' : `status: ${r.status}`)
    } catch (e) {
      setHealth(e.message)
    }
  }

  return (
    <CRow>
      <CCol lg={7}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Koneksi API</strong>
          </CCardHeader>
          <CForm onSubmit={onSave}>
            <CCardBody>
              <div className="mb-3">
                <CFormLabel>Base URL API</CFormLabel>
                <CFormInput
                  value={cfg.baseUrl}
                  onChange={(e) => update({ baseUrl: e.target.value })}
                  placeholder="http://localhost:8000"
                  required
                />
                <small className="text-body-secondary">
                  Prefix <code>/api/v1</code> ditambahkan otomatis.
                </small>
              </div>
              <div className="mb-3">
                <CFormLabel>Versi consent</CFormLabel>
                <CFormInput
                  value={cfg.consentVersion}
                  onChange={(e) => update({ consentVersion: e.target.value })}
                />
                <small className="text-body-secondary">Dipakai saat membuat sesi tamu.</small>
              </div>
              <div className="mb-3">
                <CFormLabel>Token sesi (Bearer)</CFormLabel>
                <CInputGroup>
                  <CFormInput
                    value={cfg.token}
                    onChange={(e) => update({ token: e.target.value })}
                    placeholder="Dibuat otomatis dari tombol di samping"
                  />
                  <CButton color="secondary" type="button" onClick={onCreateSession} disabled={creatingSession}>
                    {creatingSession ? <CSpinner size="sm" /> : 'Buat sesi'}
                  </CButton>
                </CInputGroup>
                <small className="text-body-secondary">
                  Untuk endpoint yang butuh sesi (RIASEC submit, katalog).
                </small>
              </div>
              <div className="mb-1">
                <CFormLabel>X-Admin-Key</CFormLabel>
                <CFormInput
                  type="password"
                  autoComplete="off"
                  value={cfg.adminKey}
                  onChange={(e) => update({ adminKey: e.target.value })}
                  placeholder="untuk ingest & unggah dokumen"
                />
                <small className="text-warning">
                  Rahasia. Hanya disimpan di <code>localStorage</code> perangkat ini.
                </small>
              </div>
            </CCardBody>
            <CCardFooter className="d-flex justify-content-between align-items-center">
              <CButton color="danger" variant="ghost" type="button" onClick={onForget}>
                Lupakan kredensial
              </CButton>
              <div className="d-flex align-items-center gap-3">
                {notice && <span className="text-body-secondary small">{notice}</span>}
                <CButton color="primary" type="submit">
                  Simpan
                </CButton>
              </div>
            </CCardFooter>
          </CForm>
        </CCard>
      </CCol>

      <CCol lg={5}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Status</strong>
          </CCardHeader>
          <CCardBody>
            {health === null && (
              <span className="text-body-secondary">
                Klik &quot;Tes koneksi&quot; untuk cek <code>/health</code>.
              </span>
            )}
            {health === 'checking' && (
              <span>
                <CSpinner size="sm" className="me-2" /> Mengecek…
              </span>
            )}
            {health === 'ok' && (
              <div>
                <span className="badge text-bg-success">terhubung</span>
                <div className="text-body-secondary small mt-2">API terjangkau di base URL ini.</div>
              </div>
            )}
            {typeof health === 'string' && !['checking', 'ok'].includes(health) && (
              <div>
                <span className="badge text-bg-danger">tidak terhubung</span>
                <div className="text-body-secondary small mt-2">{health}</div>
              </div>
            )}
          </CCardBody>
          <CCardFooter>
            <CButton color="secondary" className="w-100" onClick={onHealth}>
              Tes koneksi
            </CButton>
          </CCardFooter>
        </CCard>
        <CCard className="mb-4">
          <CCardBody className="text-body-secondary small">
            <strong>Catatan privasi.</strong> Dashboard tidak menyimpan rahasia di repositori.
            Token dan admin key hidup di peramban Anda dan bisa dihapus kapan saja.
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Settings
