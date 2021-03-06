import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Routes from './Routes'
import Layout from './Layout'
import './style.css'

const Init = props => (
  <Router basename={process.env.APP_BASE}>
    <HelmetProvider>
      <Layout>
        <Routes {...props} />
      </Layout>
    </HelmetProvider>
  </Router>
)

document.addEventListener('DOMContentLoaded', () => {
  const initData = window.__INIT_DATA // eslint-disable-line no-underscore-dangle
  ReactDOM.hydrate(<Init initData={initData} />, document.getElementById(process.env.MOUNT))
})
