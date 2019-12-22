import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import Nav from './Nav'
import Footer from './Footer'

const { APP_TITLE } = process.env

export default function Layout({ children }) {
  return (
    <div className="layout">
      <Helmet
        defaultTitle={APP_TITLE}
        titleTemplate={`${APP_TITLE} | %s`}
      />
      <Nav />
      <div className="main">
        {children}
      </div>
      <Footer />
    </div>
  )
}
