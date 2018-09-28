/* global __APPBASE:false, __DEV:false, __MOUNT:false */
import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import Routes from './Routes'
import './style.css'

const Init = props => (
  <Router basename={__APPBASE}>
    <Routes {...props} />
  </Router>
)

const root = document.getElementById(__MOUNT)

document.addEventListener('DOMContentLoaded', () => {
  // eslint-disable-next-line no-underscore-dangle
  const props = typeof window.__INITIAL_DATA === 'object'
    ? window.__INITIAL_DATA
    : {}
  ReactDOM.render(<Init {...props} />, root)
})

if (__DEV) {
  /* eslint-disable global-require,import/no-extraneous-dependencies */
  require('webpack-serve-overlay')
}
