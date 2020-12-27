import * as React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Routes from './Routes'
import './style.css'

const { MOUNT, APP_BASE } = process.env

const Init = ({ ...props }) => (
  <Router basename={APP_BASE}>
    <HelmetProvider>
      <Routes {...props} />
    </HelmetProvider>
  </Router>
)

if (document) {
  document.addEventListener('DOMContentLoaded', () => {
    // eslint-disable-next-line no-underscore-dangle
    let initData = {}
    try {
      initData = JSON.parse(window.__INIT_DATA)
    } catch (e) {}
    ReactDOM.hydrate(Init({ initData }), document.getElementById(MOUNT))
  })
}

export default Init
