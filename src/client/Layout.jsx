import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import Nav from './Nav'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Helmet
        defaultTitle={__appTitle}
        titleTemplate={`${__appTitle} | %s`}
      />
      <Nav />
      <div className="main">
        {children}
      </div>
      <Footer />
    </div>
  )
}
