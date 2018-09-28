/* global __APPBASE:false, __DEV:false, __MOUNT:false */
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import Routes from './Routes'
import Layout from './Layout'
import './style.css'

const Init = props => (
  <Router basename={__APPBASE}>
    <HelmetProvider>
      <Layout>
        <Routes {...props} />
      </Layout>
    </HelmetProvider>
  </Router>
)

document.addEventListener('DOMContentLoaded', () => {
  const initData = window.__INIT_DATA // eslint-disable-line no-underscore-dangle
  const props = typeof initData === 'object' ? initData : {}
  const root = document.getElementById(__MOUNT)
  ReactDOM.hydrate(<Init initData={props} />, root)
})

if (__DEV) {
  /* eslint-disable global-require,import/no-extraneous-dependencies */
  require('webpack-serve-overlay')
}
