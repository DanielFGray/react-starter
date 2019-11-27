import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import Nav from './Nav'

const { APP_TITLE } = process.env

const Layout = ({ children }) => (
  <div className="layout">
    <Helmet
      defaultTitle={APP_TITLE}
      titleTemplate={`${APP_TITLE} | %s`}
    />
    <Nav />
    <div className="main">
      {children}
    </div>
  </div>
)

export default Layout
