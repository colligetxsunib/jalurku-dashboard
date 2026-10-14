/**
 * RIASEC interest-test maintenance view.
 *
 * Inspects the live instrument (GET /riasec/questions) and runs a deterministic,
 * non-saving scoring preview (POST /riasec/submit with simpan=false), visualizing
 * the resulting interest vector and Holland code.
 *
 * @component
 */

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  CBadge,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CSpinner,
} from '@coreui/react'
import { api, ApiError } from 'src/api/client'
import ApiErrorAlert from 'src/components/ApiErrorAlert'

const COLORS = ['primary', 'info', 'success', 'warning', 'danger', 'secondary']

const Riasec = () => {
  const [instrumen, setInstrumen] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [submitError, setSubmitError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    api
      .riasecQuestions()
      .then((d) => active && setInstrumen(d))
      .catch((e) => active && setLoadError(e))
    return () => {
      active = false
    }
  }, [])

  const setAnswer = (id, val) => setAnswers((a) => ({ ...a, [id]: val }))
  const clearAll = () => {
    setAnswers({})
    setResult(null)
  }
  const fillRandom = () => {
    if (!instrumen) return
    const { min, maks } = instrumen.skala
    const next = {}
    instrumen.item.forEach((it) => {
      next[it.id] = min + Math.floor(Math.random() * (maks - min + 1))
    })
    setAnswers(next)
  }

  const onSubmit = async () => {
    if (!Object.keys(answers).length) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await api.riasecSubmit(answers, false) // preview: never saves
      setResult(res)
    } catch (e) {
      setSubmitError(e)
      setResult(null)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadError) {
    return (
      <>
        <ApiErrorAlert error={loadError} />
        <div className="text-body-secondary">
          Pastikan Base URL benar di <a href="#/jalurku/settings">Pengaturan</a>.
        </div>
      </>
    )
  }
  if (!instrumen) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" /> <div className="mt-2">Mengambil instrumen…</div>
      </div>
    )
  }

  const scale = []
  for (let v = instrumen.skala.min; v <= instrumen.skala.maks; v++) {
    scale.push({ v, label: instrumen.skala.label?.[String(v)] })
  }
  const byDim = {}
  instrumen.dimensi.forEach((d) => (byDim[d] = []))
  instrumen.item.forEach((it) => (byDim[it.dimensi] ||= []).push(it))
  const answered = Object.keys(answers).length

  return (
    <>
      {/* instrument summary */}
      <CCard className="mb-4">
        <CCardBody className="d-flex flex-wrap gap-4 align-items-center">
          <div>
            <div className="text-body-secondary small">Versi instrumen</div>
            <div className="fs-4">{instrumen.versi_instrumen}</div>
          </div>
          <div className="vr" />
          <div>
            <div className="text-body-secondary small">Jumlah item</div>
            <div className="fs-4">{instrumen.item.length}</div>
          </div>
          <div className="vr" />
          <div>
            <div className="text-body-secondary small">Dimensi</div>
            <div className="d-flex flex-wrap gap-1">
              {instrumen.dimensi.map((d, i) => (
                <CBadge key={d} color={COLORS[i % COLORS.length]} shape="rounded-pill">
                  {d}
                </CBadge>
              ))}
            </div>
          </div>
          <div className="vr" />
          <div className="flex-fill">
            <div className="text-body-secondary small">Sumber</div>
            <div>{instrumen.sumber || '—'}</div>
          </div>
        </CCardBody>
      </CCard>

      <CRow>
        {/* questionnaire */}
        <CCol lg={7}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <strong>Kuesioner (uji coba)</strong>
              <CButtonGroup size="sm">
                <CButton color="secondary" variant="outline" onClick={fillRandom}>
                  Isi acak
                </CButton>
                <CButton color="secondary" variant="outline" onClick={clearAll}>
                  Kosongkan
                </CButton>
              </CButtonGroup>
            </CCardHeader>
            <CCardBody>
              {instrumen.dimensi.map((d, di) => (
                <div className="mb-4" key={d}>
                  <CBadge color={COLORS[di % COLORS.length]} className="mb-2">
                    {d}
                  </CBadge>
                  {byDim[d].map((it) => (
                    <div className="mb-2" key={it.id}>
                      <div className="mb-1">
                        {it.teks} <span className="text-body-secondary small">· {it.id}</span>
                      </div>
                      <CButtonGroup role="group" size="sm">
                        {scale.map((s) => (
                          <CButton
                            key={s.v}
                            color="primary"
                            variant={answers[it.id] === s.v ? undefined : 'outline'}
                            title={s.label || String(s.v)}
                            onClick={() => setAnswer(it.id, s.v)}
                          >
                            {s.v}
                          </CButton>
                        ))}
                      </CButtonGroup>
                    </div>
                  ))}
                </div>
              ))}
            </CCardBody>
            <CCardFooter className="d-flex justify-content-between align-items-center">
              <span className="text-body-secondary small">
                {answered} / {instrumen.item.length} terjawab
              </span>
              <CButton color="primary" onClick={onSubmit} disabled={submitting || !answered}>
                {submitting ? <CSpinner size="sm" /> : 'Hitung skor (pratinjau)'}
              </CButton>
            </CCardFooter>
          </CCard>
        </CCol>

        {/* result */}
        <CCol lg={5}>
          <CCard className="mb-4">
            <CCardHeader>
              <strong>Hasil skoring</strong>
            </CCardHeader>
            <CCardBody>
              {submitError && (
                <>
                  <ApiErrorAlert error={submitError} />
                  {submitError instanceof ApiError && submitError.status === 401 && (
                    <div className="text-body-secondary small">
                      Butuh token sesi. Buka <a href="#/jalurku/settings">Pengaturan</a> → &quot;Buat sesi&quot;.
                    </div>
                  )}
                </>
              )}
              {!result && !submitError && (
                <div className="text-body-secondary py-4 text-center">
                  Isi beberapa item lalu klik &quot;Hitung skor&quot;.
                </div>
              )}
              {result && <ResultView instrumen={instrumen} result={result} />}
            </CCardBody>
          </CCard>
          <CCard className="mb-4">
            <CCardBody className="text-body-secondary small">
              Pratinjau ini mengirim <code>simpan: false</code> — tidak menulis ke profil mana pun.
              Skoring bersifat deterministik di backend (tanpa LLM).
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

const ResultView = ({ instrumen, result }) => (
  <>
    <div className="text-center mb-3">
      <div className="text-body-secondary small text-uppercase">Holland code</div>
      <div className="display-6 fw-bold text-primary" style={{ letterSpacing: '0.15em' }}>
        {result.holland_code || '—'}
      </div>
      <div className="mt-2 d-flex justify-content-center gap-1 flex-wrap">
        {(result.dimensi_teratas || []).map((d) => (
          <CBadge key={d} color="success">
            {d}
          </CBadge>
        ))}
      </div>
    </div>
    {instrumen.dimensi.map((d, i) => {
      const v = result.skor_norm?.[d] ?? 0
      return (
        <div className="mb-2" key={d}>
          <div className="d-flex justify-content-between small">
            <span className="text-capitalize">{d}</span>
            <span className="text-body-secondary">{v.toFixed(2)}</span>
          </div>
          <CProgress thin color={COLORS[i % COLORS.length]} value={Math.round(v * 100)} />
        </div>
      )
    })}
    <div className="mt-3 text-body-secondary small">
      {result.terjawab} dari {result.total_item} item terjawab ·{' '}
      {result.tersimpan ? 'disimpan ke profil' : 'pratinjau (tidak disimpan)'}
    </div>
    {result.catatan && <div className="mt-2 small text-body-secondary">{result.catatan}</div>}
    <details className="mt-3">
      <summary className="text-body-secondary small">Lihat respons mentah</summary>
      <pre className="mt-2 p-2 bg-body-tertiary rounded small" style={{ whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(result, null, 2)}
      </pre>
    </details>
  </>
)

ResultView.propTypes = {
  instrumen: PropTypes.object.isRequired,
  result: PropTypes.object.isRequired,
}

export default Riasec
