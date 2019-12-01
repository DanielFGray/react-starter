import koaHelmet from 'koa-helmet'
import kcompose from 'koa-compose'
import { ApolloServer } from 'apollo-server-koa'
import send from 'koa-send'
import SSR from './SSR'
import schema from './schema'

const logger = () => async (ctx, next) => {
  const start = Date.now()
  await next()
  const time = `${Date.now() - start}ms`
  console.log(`${ctx.method} ${ctx.url} ${ctx.status} - ${time}`)
}

const staticFiles = opts => async (ctx, next) => {
  try {
    if (ctx.path !== '/') {
      return await send(ctx, ctx.path, opts)
    }
  } catch (e) {
    /* fallthrough */
  }
  return next()
}

export default function app({
  appBase,
  publicDir,
}) {
  const apolloServer = new ApolloServer({ schema })
  return kcompose([
    koaHelmet(),
    logger(),
    staticFiles({ root: publicDir }),
    apolloServer.getMiddleware(),
    SSR({ appBase, schema }),
  ])
}
