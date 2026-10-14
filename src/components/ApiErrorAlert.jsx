/**
 * ApiErrorAlert
 *
 * Renders an {@link ApiError} as a CoreUI danger alert, including the backend's
 * per-field validation detail (`detail.field[]`) when present.
 *
 * @component
 */

import React from 'react'
import PropTypes from 'prop-types'
import { CAlert } from '@coreui/react'

const ApiErrorAlert = ({ error }) => {
  if (!error) return null
  const fields = error?.detail?.field
  return (
    <CAlert color="danger" className="mb-3">
      <h5 className="alert-heading">
        {error.kode || 'kesalahan'}
        {error.status ? ` (HTTP ${error.status})` : ''}
      </h5>
      <div>{error.message || 'Terjadi kesalahan'}</div>
      {Array.isArray(fields) && fields.length > 0 && (
        <ul className="mb-0 mt-2">
          {fields.map((f, i) => (
            <li key={i}>
              <code>{f.field}</code>: {f.pesan}
            </li>
          ))}
        </ul>
      )}
    </CAlert>
  )
}

ApiErrorAlert.propTypes = {
  error: PropTypes.object,
}

export default ApiErrorAlert
