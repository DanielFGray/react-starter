import * as React from 'react'
import Helmet from 'react-helmet-async'
import Nav from './Nav'

const Layout = ({ children }) => (
  <div className="layout">
    <Helmet
      defaultTitle={__appTitle}
      titleTemplate={`${__appTitle} | %s`}
    />
    <Nav />
    <div className="main">
      {children}
    </div>
  </div>
)

export default Layout
