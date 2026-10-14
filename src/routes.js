/**
 * Application routes for the JalurKu maintenance dashboard.
 *
 * Lazy-loaded views mapped to paths, consumed by AppContent and AppBreadcrumb.
 *
 * @module routes
 */

import React from 'react'

const Overview = React.lazy(() => import('./views/jalurku/Overview'))
const Riasec = React.lazy(() => import('./views/jalurku/Riasec'))
const Ingest = React.lazy(() => import('./views/jalurku/Ingest'))
const Documents = React.lazy(() => import('./views/jalurku/Documents'))
const Catalog = React.lazy(() => import('./views/jalurku/Catalog'))
const Settings = React.lazy(() => import('./views/jalurku/Settings'))

export const routes = [
  { path: '/', exact: true, name: 'Beranda' },
  { path: '/jalurku', exact: true, name: 'JalurKu' },
  { path: '/jalurku/overview', name: 'Ringkasan', element: Overview },
  { path: '/jalurku/riasec', name: 'Tes Minat (RIASEC)', element: Riasec },
  { path: '/jalurku/ingest', name: 'Ingest Data', element: Ingest },
  { path: '/jalurku/documents', name: 'Dokumen RAG', element: Documents },
  { path: '/jalurku/catalog', name: 'Katalog', element: Catalog },
  { path: '/jalurku/settings', name: 'Pengaturan', element: Settings },
]

export default routes
