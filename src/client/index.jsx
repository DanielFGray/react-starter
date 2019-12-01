import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import Layout from './Layout'

import 'normalize.css'
import './style.css'

function main() {
  const cache = new InMemoryCache()

  try {
    const initData = JSON.parse(window.__INIT_DATA) // eslint-disable-line no-underscore-dangle
    if (initData) {
      cache.restore(initData)
    }
  } catch (e) {
    console.error('unable to load cache', e)
  }

  const apolloClient = new ApolloClient({
    cache,
    link: new HttpLink({
      credentials: 'same-origin',
      uri: '/graphql',
    }),
  })

  const Init = (
    <ApolloProvider client={apolloClient}>
      <Router basename={process.env.APP_BASE}>
        <HelmetProvider>
          <Layout />
        </HelmetProvider>
      </Router>
    </ApolloProvider>
  )

  ReactDOM.hydrate(Init, document.getElementById(process.env.MOUNT))
}

document.addEventListener('DOMContentLoaded', main)
