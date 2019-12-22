import * as React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Routes from './Routes'
import Layout from './Layout'
import './style.css'

const { MOUNT, APP_BASE } = process.env

const Init = props => (
  <Router basename={APP_BASE}>
    <HelmetProvider>
      <Layout>
        <Routes {...props} />
      </Layout>
    </HelmetProvider>
  </Router>
)

if (document) {
  document.addEventListener('DOMContentLoaded', () => {
    // eslint-disable-next-line no-underscore-dangle
    const rootEl = document.getElementById(MOUNT)
    ReactDOM.hydrate(<Init initData={window.__INIT_DATA} />, rootEl)
  })
}

export default Init
