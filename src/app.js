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

export default async function app(app) {
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch (e) {
      console.log(e)
      ctx.status = 500
      ctx.body = 'Internal Server Error'
    }
  })

  app.use(koaHelmet())

  const apolloServer = new ApolloServer({ schema })

  app.use(logger())
  app.use(koaHelmet())
  app.use(staticFiles({ root: PUBLIC_DIR }))

  apolloServer.applyMiddleware({ app })

  app.use(SSR({ appBase: APP_BASE, schema }))

  return app
}
