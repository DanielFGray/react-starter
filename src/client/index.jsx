import * as React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import Routes from './Routes'
import Layout from './Layout'
import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const initData = window.__INIT_DATA // eslint-disable-line no-underscore-dangle

  const apolloClient = new ApolloClient({
    cache: new InMemoryCache().restore(initData),
    link: new HttpLink({
      credentials: 'same-origin',
      uri: '/graphql',
    }),
  })

  const Init = (
    <ApolloProvider client={apolloClient}>
      <Router basename={__appBase}>
        <HelmetProvider>
          <Layout>
            <Routes />
          </Layout>
        </HelmetProvider>
      </Router>
    </ApolloProvider>
  )

  ReactDOM.hydrate(Init, document.getElementById(__mount))
})
