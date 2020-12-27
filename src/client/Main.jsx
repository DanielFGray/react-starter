import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import Layout from './components/DefaultLayout'
import useJson from './useJson'
import Stringify from './components/Stringify'

export default function Main({ initData }) {
  const [{ error, loading, data }, refetch] = useJson('/api/v1/test', { initData })

  if (error) {
    return (
      <>
        <h1>oops!</h1>
        <p>{Stringify({ error, message: error.message })}</p>
      </>
    )
  }

  return (
    <Layout>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <div>
        <button type="button" onClick={() => refetch()}>
          Reload
        </button>
      </div>
      {Stringify({ loading, data })}
    </Layout>
  )
}
