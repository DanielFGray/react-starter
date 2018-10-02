/* global __non_webpack_require__:false */
/* eslint-disable no-console */
import Koa from 'koa'
import Router from 'koa-router'
import send from 'koa-send'
import koaHelmet from 'koa-helmet'
import { ApolloServer, gql } from 'apollo-server-koa'
import { makeExecutableSchema } from 'graphql-tools'
import SSR from './SSR'

const {
  appBase,
  host,
  port,
  publicDir,
} = __non_webpack_require__('../config')

const app = new Koa()

const typeDefs = gql`
  type Item {
    id: Int
    content: String
    seed: Int
  }

  type Query {
    getList: [Item]
  }`

const resolvers = {
  Query: {
    // foo: async (root, { variables }) => {},
    getList: () => [{
      id: 1,
      content: 'hello world',
      seed: Math.random(),
    }],
  },
}

const schema = makeExecutableSchema({ typeDefs, resolvers })
const apolloServer = new ApolloServer({ schema })

apolloServer.applyMiddleware({ app })

const router = new Router()
  .get(['/', '/*'], SSR({ appBase, schema }))

app
  .use(koaHelmet())

  .use(async (ctx, next) => {
    await next()
    const rt = ctx.response.get('X-Response-Time')
    console.log(`${ctx.method} ${ctx.url} ${ctx.status} - ${rt}`)
  })

  .use(async (ctx, next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start
    ctx.set('X-Response-Time', `${ms}ms`)
  })

  .use(async (ctx, next) => {
    try {
      if (ctx.path !== '/') {
        return await send(ctx, ctx.path, { root: publicDir })
      }
    } catch (e) {
      /* fallthrough */
    }
    return next()
  })

  .use(router.routes())
  .use(router.allowedMethods())

  .listen(port, host, () => console.log(`
    server now running on http://${host}:${port}`))

process.on('uncaughtException', console.error)
process.on('exit', () => console.log('exiting!'))
process.on('SIGINT', () => console.log('interrupted!'))

export default app
