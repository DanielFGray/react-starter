import * as React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'
import Helmet from 'react-helmet-async'
import Stringify from './Stringify'

const query = gql`
  query getList {
    getList {
      id
      content
    }
  }`

const Main = props => (
  // <Query query={query} variables={{ variables }}>
  <>
    <Helmet>
      <title>Home</title>
    </Helmet>
    <Query query={query}>
      {({ loading, error, data }) => {
        if (error) return `Error! ${error.message}`
        if (loading) return 'Loading...'
        return Stringify({ props, gqlData: data })
      }}
    </Query>
  </>
)

export default Main
