import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <span>JalurKu · Dashboard Maintenance</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">UI oleh</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          CoreUI React Admin Template
        </a>
        <span className="ms-1">(MIT)</span>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
