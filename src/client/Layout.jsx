/* global __APPTITLE:false */
import * as React from 'react'
import Helmet from 'react-helmet-async'
import Nav from './Nav'

const Layout = ({ children }) => (
  <div className="layout">
    <Helmet
      defaultTitle={__APPTITLE}
      titleTemplate={`${__APPTITLE} | %s`}
    />
    <Nav />
    <div className="main">
      {children}
    </div>
  </div>
)

export default Layout
