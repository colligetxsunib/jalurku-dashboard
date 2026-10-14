/**
 * Catalog view: browse PTN and prodi reference data (GET /catalog/*).
 *
 * Requires a session token. Prodi rows expose whether tag_minat is present (relevant to
 * the RIASEC -> field recommendation pipeline) and a detail drill-down.
 *
 * @component
 */

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormSelect,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { api, ApiError } from 'src/api/client'
import ApiErrorAlert from 'src/components/ApiErrorAlert'

const Catalog = () => {
  const [tab, setTab] = useState('ptn')
  return (
    <CCard className="mb-4">
      <CCardHeader>
        <CNav variant="tabs" className="card-header-tabs">
          <CNavItem>
            <CNavLink active={tab === 'ptn'} onClick={() => setTab('ptn')} role="button">
              PTN
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink active={tab === 'prodi'} onClick={() => setTab('prodi')} role="button">
              Prodi
            </CNavLink>
          </CNavItem>
        </CNav>
      </CCardHeader>
      <CCardBody>{tab === 'ptn' ? <PtnTab /> : <ProdiTab />}</CCardBody>
    </CCard>
  )
}

const useSearch = (fetcher, initial) => {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const run = async (params) => {
    setLoading(true)
    setError(null)
    try {
      setData(await fetcher(params))
    } catch (e) {
      setError(e)
      setData(null)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    run(initial)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  return { data, error, loading, run }
}

const AuthHint = ({ error }) =>
  error instanceof ApiError && error.status === 401 ? (
    <div className="text-body-secondary small">
      Butuh token sesi. Buka <a href="#/jalurku/settings">Pengaturan</a> → &quot;Buat sesi&quot;.
    </div>
  ) : null

AuthHint.propTypes = {
  error: PropTypes.object,
}

const PtnTab = () => {
  const [q, setQ] = useState('')
  const [provinsi, setProvinsi] = useState('')
  const { data, error, loading, run } = useSearch(api.listPtn, { limit: 20 })

  return (
    <>
      <CForm
        className="row g-2 mb-3"
        onSubmit={(e) => {
          e.preventDefault()
          run({ q, provinsi, limit: 20 })
        }}
      >
        <CCol>
          <CFormInput placeholder="Cari PTN…" value={q} onChange={(e) => setQ(e.target.value)} />
        </CCol>
        <CCol>
          <CFormInput
            placeholder="provinsi (opsional)"
            value={provinsi}
            onChange={(e) => setProvinsi(e.target.value)}
          />
        </CCol>
        <CCol xs="auto">
          <CButton type="submit" color="primary">
            Cari
          </CButton>
        </CCol>
      </CForm>
      {loading && <CSpinner color="primary" />}
      {error && (
        <>
          <ApiErrorAlert error={error} />
          <AuthHint error={error} />
        </>
      )}
      {data && (
        <>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nama</CTableHeaderCell>
                <CTableHeaderCell>Provinsi</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {(data.items || []).map((p) => (
                <CTableRow key={p.id}>
                  <CTableDataCell>{p.id}</CTableDataCell>
                  <CTableDataCell>{p.nama}</CTableDataCell>
                  <CTableDataCell>{p.provinsi}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <div className="text-body-secondary small">
            Total {data.total} · halaman {data.page}
          </div>
        </>
      )}
    </>
  )
}

const ProdiTab = () => {
  const [q, setQ] = useState('')
  const [rumpun, setRumpun] = useState('')
  const [jalur, setJalur] = useState('')
  const [detail, setDetail] = useState(null)
  const { data, error, loading, run } = useSearch(api.listProdi, { limit: 20 })

  if (detail) {
    return (
      <>
        <CButton size="sm" color="secondary" className="mb-3" onClick={() => setDetail(null)}>
          ← Kembali
        </CButton>
        <h5>{detail.nama || detail.id}</h5>
        <pre className="p-2 bg-body-tertiary rounded small" style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(detail, null, 2)}
        </pre>
      </>
    )
  }

  const openDetail = async (id) => {
    try {
      setDetail(await api.detailProdi(id))
    } catch {
      /* error ditampilkan via tabel bila perlu */
    }
  }

  return (
    <>
      <CForm
        className="row g-2 mb-3"
        onSubmit={(e) => {
          e.preventDefault()
          run({ q, rumpun, jalur, limit: 20 })
        }}
      >
        <CCol>
          <CFormInput placeholder="Cari prodi…" value={q} onChange={(e) => setQ(e.target.value)} />
        </CCol>
        <CCol xs="auto">
          <CFormInput placeholder="rumpun" value={rumpun} onChange={(e) => setRumpun(e.target.value)} />
        </CCol>
        <CCol xs="auto">
          <CFormSelect value={jalur} onChange={(e) => setJalur(e.target.value)}>
            <option value="">semua jalur</option>
            <option>SNBP</option>
            <option>SNBT</option>
          </CFormSelect>
        </CCol>
        <CCol xs="auto">
          <CButton type="submit" color="primary">
            Cari
          </CButton>
        </CCol>
      </CForm>
      {loading && <CSpinner color="primary" />}
      {error && (
        <>
          <ApiErrorAlert error={error} />
          <AuthHint error={error} />
        </>
      )}
      {data && (
        <>
          <CTable hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nama</CTableHeaderCell>
                <CTableHeaderCell>Rumpun</CTableHeaderCell>
                <CTableHeaderCell>tag_minat</CTableHeaderCell>
                <CTableHeaderCell />
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {(data.items || []).map((p) => (
                <CTableRow key={p.id}>
                  <CTableDataCell>{p.id}</CTableDataCell>
                  <CTableDataCell>{p.nama}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="info">{p.rumpun || '—'}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    {p.tag_minat ? (
                      <CBadge color="success">ada</CBadge>
                    ) : (
                      <span className="text-body-secondary">—</span>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton size="sm" color="secondary" variant="outline" onClick={() => openDetail(p.id)}>
                      Detail
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <div className="text-body-secondary small">
            Total {data.total} · halaman {data.page}
          </div>
        </>
      )}
    </>
  )
}

export default Catalog
