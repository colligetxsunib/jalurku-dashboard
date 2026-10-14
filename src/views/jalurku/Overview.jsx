/**
 * Overview view: service health + shortcuts to the maintainable areas.
 *
 * @component
 */

import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCol, CRow, CSpinner, CWidgetStatsB } from '@coreui/react'
import { api } from 'src/api/client'
import { loadConfig } from 'src/api/config'

const CARDS = [
  { to: '#/jalurku/riasec', label: 'Tes Minat (RIASEC)', desc: 'Instrumen & uji skoring', color: 'primary' },
  { to: '#/jalurku/ingest', label: 'Ingest Data', desc: 'rules, ketentuan, katalog, acuan, dokumen, profesi', color: 'success' },
  { to: '#/jalurku/documents', label: 'Dokumen RAG', desc: 'Unggah PDF sumber resmi', color: 'info' },
  { to: '#/jalurku/catalog', label: 'Katalog', desc: 'Telusuri PTN & prodi', color: 'warning' },
]

const Overview = () => {
  const [health, setHealth] = useState('checking')
  const cfg = loadConfig()

  useEffect(() => {
    let active = true
    api
      .health()
      .then((r) => active && setHealth(r.status === 'ok' ? 'ok' : `status: ${r.status}`))
      .catch((e) => active && setHealth(e.message))
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <CRow className="mb-2">
        <CCol sm={6} lg={4}>
          <CCard className="mb-4">
            <CCardBody>
              <div className="text-body-secondary text-uppercase small fw-semibold">Status layanan</div>
              <div className="mt-2">
                {health === 'checking' ? (
                  <span>
                    <CSpinner size="sm" className="me-2" />
                    mengecek…
                  </span>
                ) : health === 'ok' ? (
                  <span className="badge text-bg-success">terhubung</span>
                ) : (
                  <>
                    <span className="badge text-bg-danger">tidak terhubung</span>
                    <div className="text-body-secondary small mt-1">{health}</div>
                  </>
                )}
              </div>
              <div className="text-body-secondary small mt-2">{cfg.baseUrl}/api/v1</div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={4}>
          <CWidgetStatsB
            className="mb-4"
            color={cfg.token ? 'success' : 'secondary'}
            value={cfg.token ? 'aktif' : 'belum ada'}
            title="Sesi"
            text={cfg.token ? 'Token tersimpan di perangkat' : 'Buat di Pengaturan'}
            progress={{ value: cfg.token ? 100 : 0 }}
          />
        </CCol>
        <CCol sm={6} lg={4}>
          <CWidgetStatsB
            className="mb-4"
            color={cfg.adminKey ? 'info' : 'secondary'}
            value={cfg.adminKey ? 'terisi' : 'belum diset'}
            title="Akses admin"
            text="X-Admin-Key untuk ingest & dokumen"
            progress={{ value: cfg.adminKey ? 100 : 0 }}
          />
        </CCol>
      </CRow>

      <CRow>
        {CARDS.map((c) => (
          <CCol md={6} xl={3} key={c.to}>
            <a href={c.to} className="text-decoration-none">
              <CCard className="mb-4 h-100">
                <CCardBody>
                  <span className={`badge text-bg-${c.color} mb-2`}>{c.label}</span>
                  <div className="text-body-secondary">{c.desc}</div>
                </CCardBody>
              </CCard>
            </a>
          </CCol>
        ))}
      </CRow>
    </>
  )
}

export default Overview
