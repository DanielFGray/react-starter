import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router'
import Layout from './components/DefaultLayout'

export default function NotFound(props) {
  const location = useLocation()
  if (props.staticContext) {
    // eslint-disable-next-line no-param-reassign
    props.staticContext.status = 404
  }
  return (
    <Layout>
      <Helmet>
        <title>Not Found</title>
      </Helmet>
      <p>{`path ${location.pathname} does not exist`}</p>
    </Layout>
  )
}
