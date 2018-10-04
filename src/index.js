/* global __non_webpack_require__:false */
/* eslint-disable no-console */
import Koa from 'koa'
import Router from 'koa-router'
import koaHelmet from 'koa-helmet'
import { ApolloServer } from 'apollo-server-koa'
import { makeExecutableSchema } from 'graphql-tools'
import { logger, staticFiles } from './koaMiddleware'
import typeDefs from './typeDefs'
import resolvers from './resolvers'
import SSR from './SSR'

const {
  appBase,
  host,
  port,
  publicDir,
} = __non_webpack_require__('../config')

const app = new Koa()
  .use(koaHelmet())

const schema = makeExecutableSchema({ typeDefs, resolvers })
const apolloServer = new ApolloServer({ schema })

apolloServer.applyMiddleware({ app })

const router = new Router()
  .get('/*', SSR({ appBase, schema }))

app
  .use(logger())
  .use(koaHelmet())
  .use(staticFiles({ root: publicDir }))
  .use(router.allowedMethods())
  .use(router.routes())
  .listen(port, host, () => console.log(`
    server now running on http://${host}:${port}`))

process.on('exit', () => console.log('exiting!'))
process.on('SIGINT', () => console.log('interrupted!'))
process.on('uncaughtException', e => {
  console.error(e)
  process.exit(1)
})

export default app
