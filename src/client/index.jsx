/* global __APPBASE:false, __MOUNT:false */
import * as React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ApolloProvider } from 'react-apollo'
import apolloClient from './apolloClient'
import Routes from './Routes'
import Layout from './Layout'
import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const initData = window.__INIT_DATA // eslint-disable-line no-underscore-dangle

  const Init = (
    <ApolloProvider client={apolloClient({ initData })}>
      <Router basename={__APPBASE}>
        <HelmetProvider>
          <Layout>
            <Routes />
          </Layout>
        </HelmetProvider>
      </Router>
    </ApolloProvider>
  )

  ReactDOM.hydrate(Init, document.getElementById(__MOUNT))
})
