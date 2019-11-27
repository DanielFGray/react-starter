import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import { hot } from 'react-hot-loader/root';
import Nav from './Nav'
import Footer from './Footer'

const { APP_TITLE } = process.env

export const Layout = ({ children }) => (
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
export default hot(Layout)
