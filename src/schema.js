import { PostgresPubSub } from 'graphql-postgres-subscriptions'
import { makeExecutableSchema } from 'graphql-tools'
import { UserInputError } from 'apollo-server-koa'
import pg from 'pg'
import gql from 'graphql-tag'
import db from './db'

const client = new pg.Client()
client.connect()

const pubsub = new PostgresPubSub({ client })

export const typeDefs = gql`
  type Blob {
    id: Int!
    title: String
    body: String
    created_at: String!
    updated_at: String!
  }

  type Query {
    BlobList: [Blob]
  }

  type Mutation {
    BlobCreate(body: String, title: String): Blob
    BlobUpdate(id: Int!, body: String, title: String): Blob
    BlobDelete(id: Int!): Int!
  }

  type Subscription {
    BlobCreated: Blob
    BlobUpdated: Blob
    BlobDeleted: Int!
  }
`

export const resolvers = {
  Query: {
    BlobList: async () => db('blobs').select(),
  },
  Mutation: {
    BlobCreate: async (_, { body, title }) => {
      const [data] = await db('blobs').insert({ body, title }).returning('*')
      pubsub.publish('BlobCreated', { BlobCreated: data })
      return data
    },
    BlobUpdate: async (_, { id, body, title }) => {
      if (body == null && title == null) throw new UserInputError('did not receive a body or title to update')
      const [data] = await db('blobs').where({ id }).update({ body, title }).returning('*')
      if (! data) throw new UserInputError(`error updating ${id}, probably doesn't exist`)
      pubsub.publish('BlobUpdated', { BlobUpdated: data })
      return data
    },
    BlobDelete: async (_, { id }) => {
      const data = await db('blobs').where({ id }).delete()
      if (data !== 1) throw new UserInputError(`error deleting ${id}, probably doesn't exist`)
      pubsub.publish('BlobDeleted', { BlobDeleted: id })
      return data
    },
  },
  Subscription: {
    BlobCreated: { subscribe: () => pubsub.asyncIterator('BlobCreated') },
    BlobUpdated: { subscribe: () => pubsub.asyncIterator('BlobUpdated') },
    BlobDeleted: { subscribe: () => pubsub.asyncIterator('BlobDeleted') },
  },
}

export default makeExecutableSchema({ typeDefs, resolvers })
