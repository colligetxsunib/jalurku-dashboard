import React from 'react'
import {
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilSettings, cilTask, cilCloudUpload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

/**
 * Header account/quick-actions dropdown for the JalurKu dashboard.
 * Links to the maintenance areas and settings; no user account concept (internal tool).
 */
const AppHeaderDropdown = () => {
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <span className="avatar avatar-md bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
          JK
        </span>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Maintenance</CDropdownHeader>
        <CDropdownItem href="#/jalurku/riasec">
          <CIcon icon={cilTask} className="me-2" />
          Tes Minat (RIASEC)
        </CDropdownItem>
        <CDropdownItem href="#/jalurku/ingest">
          <CIcon icon={cilCloudUpload} className="me-2" />
          Ingest Data
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem href="#/jalurku/settings">
          <CIcon icon={cilSettings} className="me-2" />
          Pengaturan
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
