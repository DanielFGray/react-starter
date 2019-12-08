import { PostgresPubSub } from 'graphql-postgres-subscriptions'
import { makeExecutableSchema } from 'graphql-tools'
import gql from 'graphql-tag'
import db from './db'
import pg from 'pg'

const client = new pg.Client()
client.connect()

const pubsub = new PostgresPubSub({ client })

export const typeDefs = gql`
  type Blob {
    id: Int!
    title: String
    blob: String!
    created_at: String!
    updated_at: String!
  }

  type Query {
    BlobList: [Blob]
  }

  type Mutation {
    BlobAdd(blob: String! title: String): [Blob]
    BlobPatch(blob: String! id: Int! title: String): [Blob]
    BlobDel(id: Int!): Int!
  }

  type Subscription {
    BlobAdded: [Blob]
    BlobPatched: [Blob]
    BlobDeleted: [Blob]
  }
`

export const resolvers = {
  Query: {
    BlobList: async () => db('blobs').select(),
  },
  Mutation: {
    BlobAdd: async (_, { blob, title }) => {
      const data = await db('blobs').insert({ blob, title }).returning('*')
      pubsub.publish('BlobAdded', { BlobAdded: data })
      return data
    },
    BlobPatch: async (_, { id, blob, title }) => {
      const data = await db('blobs').where({ id }).update({ blob, title }).returning('*')
      pubsub.publish('BlobPatched', { BlobPatched: data })
      return data
    },
    BlobDel: async (_, { id }) => {
      const data = await db('blobs').where({ id }).delete()
      pubsub.publish('BlobDeleted', { BlobDeleted: id })
      return data
    },
  },
  Subscription: {
    BlobAdded: { subscribe: () => pubsub.asyncIterator(['BlobAdded']) },
    BlobPatched: { subscribe: () => pubsub.asyncIterator(['BlobPatched']) },
    BlobDeleted: { subscribe: () => pubsub.asyncIterator(['BlobDeleted']) },
  },
}

export default makeExecutableSchema({ typeDefs, resolvers })
