import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import { useGraphql } from './useFetch'
import Stringify from './Stringify'

const ErrorComponent = error => (
  <>
    <h1>oops!</h1>
    <p>{error.message || Stringify(error)}</p>
  </>
)

export default function Main() {
  const [{
    error,
    loading,
    response,
  }, refetch] = useGraphql('https://dfg.rocks/graphql', {
    query: `query {
      BlogList {
        title
        excerpt
        category
        tags
      }
    }`,
  })

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
      {loading
        ? 'Loading'
        : error
          ? ErrorComponent(error)
          : <Stringify {...{ ...response.body }} />}
    </div>
  )
}
