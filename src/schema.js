import { makeExecutableSchema } from 'graphql-tools'
import gql from 'graphql-tag'
import db from './db'

export const typeDefs = gql`
  type Message {
    id: Int!
    message: String!
  }

  type Query {
    MessageList: [Message]
  }

  type Mutation {
    MessageAdd(message: String!): [Message]
    MessagePatch(message: String! id: Int!): [Message]
    MessageDel(id: Int!): Int!
  }
`

export const resolvers = {
  Query: {
    MessageList: () => db('messages').select(),
  },
  Mutation: {
    MessageAdd: (_, { message }) => db('messages').insert({ message }).returning('*'),
    MessagePatch: (_, { id, message }) => db('messages').where({ id }).update({ message }).returning('*'),
    MessageDel: (_, { id }) => db('messages').where({ id }).delete(),
  },
}

export default makeExecutableSchema({ typeDefs, resolvers })
