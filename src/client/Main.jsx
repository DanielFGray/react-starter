import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import useApi from './GetApi'

const Stringify = data => <pre>{JSON.stringify(data, null, 2)}</pre>

export default function Main (props) {
  const [{
    error,
    loading,
    reload,
    data,
  }, refetch] = useApi({ url: "/", autoFetch: false, initData: props.initData })
  return (
    <div>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <div>
        <button type="button" onClick={refetch}>
          Reload
        </button>
      </div>
      {Stringify({
        seed: Math.random(),
        loading,
        data,
        props,
      })}
    </div>
  )
}
