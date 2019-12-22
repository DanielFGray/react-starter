import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import useJson from './useJson'

const Stringify = data => <pre>{JSON.stringify(data, null, 2)}</pre>

export default function Main(props) {
  const [{
    error,
    loading,
    data,
  }, refetch] = useJson('/api/v1/test')

  if (error) {
    return (
      <>
        <h1>oops!</h1>
        <p>{error.message || Stringify(error)}</p>
      </>
    )
  }

  return (
    <div>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <div>
        <button type="button" onClick={() => refetch()}>
          Reload
        </button>
      </div>
      {Stringify({
        loading,
        data: data || props.initData,
      })}
    </div>
  )
}
