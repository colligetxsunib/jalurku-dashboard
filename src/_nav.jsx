/**
 * Sidebar navigation for the JalurKu maintenance dashboard.
 *
 * @module _nav
 */

import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilTask,
  cilCloudUpload,
  cilFile,
  cilLibrary,
  cilSettings,
} from '@coreui/icons'
import { CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Ringkasan',
    to: '/jalurku/overview',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Maintenance',
  },
  {
    component: CNavItem,
    name: 'Tes Minat (RIASEC)',
    to: '/jalurku/riasec',
    icon: <CIcon icon={cilTask} customClassName="nav-icon" />,
    badge: { color: 'info', text: 'INTI' },
  },
  {
    component: CNavItem,
    name: 'Ingest Data',
    to: '/jalurku/ingest',
    icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Dokumen RAG',
    to: '/jalurku/documents',
    icon: <CIcon icon={cilFile} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Katalog',
    to: '/jalurku/catalog',
    icon: <CIcon icon={cilLibrary} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Konfigurasi',
  },
  {
    component: CNavItem,
    name: 'Pengaturan',
    to: '/jalurku/settings',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
]

export default _nav
