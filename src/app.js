import Koa from 'koa'
import Router from 'koa-router'
import koaHelmet from 'koa-helmet'
import { ApolloServer } from 'apollo-server-koa'
import { logger, staticFiles } from './koaMiddleware'
import schema from './schema'
import SSR from './SSR'

const {
  APP_BASE,
  PUBLIC_DIR,
} = process.env

export default async function app() {
  const app = new Koa()
    .use(async (ctx, next) => {
      try {
        await next()
      } catch (e) {
        console.log(e)
        ctx.status = 500
        ctx.body = 'Internal Server Error'
      }
    })
    .use(koaHelmet())

  const apolloServer = new ApolloServer({ schema })

  const router = new Router()
    .get('/*', SSR({ APP_BASE, schema }))

  app
    .use(logger())
    .use(koaHelmet())
    .use(staticFiles({ root: PUBLIC_DIR }))

  apolloServer.applyMiddleware({ app })

  app
    .use(router.allowedMethods())
    .use(router.routes())

  return app
}
