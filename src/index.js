/* global __non_webpack_require__:false */
/* eslint-disable no-console */
import Koa from 'koa'
import Router from 'koa-router'
import koaHelmet from 'koa-helmet'
import { ApolloServer } from 'apollo-server-koa'
import { logger, staticFiles } from './koaMiddleware'
import schema from './schema'
import SSR from './SSR'

const {
  appBase,
  host,
  port,
  publicDir,
} = __non_webpack_require__('../config')

const app = new Koa()
  .use(koaHelmet())

const apolloServer = new ApolloServer({ schema })


const router = new Router()
  .get('/*', SSR({ appBase, schema }))

app
  .use(logger())
  .use(koaHelmet())
  .use(staticFiles({ root: publicDir }))

apolloServer.applyMiddleware({ app })

app
  .use(router.allowedMethods())
  .use(router.routes())
  .listen(port, host, () => console.log(`
    server now running on http://${host}:${port}`))

process.on('exit', () => console.log('exiting!'))
process.on('SIGINT', () => {
  console.log('interrupted!')
  process.exit(1)
})
process.on('uncaughtException', e => {
  console.error(e)
  process.exit(1)
})

export default app
