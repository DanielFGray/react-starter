import gql from 'graphql-tag'

const typeDefs = gql`
  type Item {
    id: Int
    content: String
    seed: Int
  }

  type Query {
    getList: [Item]
  }`


export default typeDefs
