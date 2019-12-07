import { makeExecutableSchema } from 'graphql-tools'
import gql from 'graphql-tag'
import db from './db'

export const typeDefs = gql`
  type Blob {
    id: Int!
    blob: String!
    created_at: String!
    updated_at: String!
  }

  type Query {
    BlobList: [Blob]
  }

  type Mutation {
    BlobAdd(blob: String!): [Blob]
    BlobPatch(blob: String! id: Int!): [Blob]
    BlobDel(id: Int!): Int!
  }
`

export const resolvers = {
  Query: {
    BlobList: () => db('blobs').select(),
  },
  Mutation: {
    BlobAdd: async (_, { blob }) => db('blobs').insert({ blob }).returning('*'),
    BlobPatch: async (_, { id, blob }) => db('blobs').where({ id }).update({ blob }).returning('*'),
    BlobDel: async (_, { id }) => db('blobs').where({ id }).delete(),
  },
}

export default makeExecutableSchema({ typeDefs, resolvers })
