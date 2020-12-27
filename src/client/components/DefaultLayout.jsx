import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import Nav from './Nav'
import Footer from './Footer'

const { APP_TITLE } = process.env

const Layout = ({ children }) => (
  <div className="layout">
    <Helmet defaultTitle={APP_TITLE} titleTemplate={`${APP_TITLE} | %s`} />
    <Nav />
    {children}
    <Footer />
  </div>
)
export default Layout
