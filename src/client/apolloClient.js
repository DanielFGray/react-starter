/* eslint-disable no-console */
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

export default ({ initData }) => {
  const cache = new InMemoryCache().restore(initData)
  return new ApolloClient({
    cache,
    link: new HttpLink({
      credentials: 'same-origin',
      uri: '/graphql',
    }),
  })
}
