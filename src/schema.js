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
    MessageDel(id: Int!): [Message]
  }
`

export const resolvers = {
  Query: {
    MessageList: () => db('messages').select(),
  },
  Mutation: {
    MessageAdd: (_, { message }) => db('messages').insert({ message })
      .then(resolvers.Query.MessageList),
    MessagePatch: (_, { id, message }) => db('messages').where({ id }).update({ message })
      .then(resolvers.Query.MessageList),
    MessageDel: (_, { id }) => db('messages').where({ id }).delete()
      .then(resolvers.Query.MessageList),
  },
}

export default makeExecutableSchema({ typeDefs, resolvers })
