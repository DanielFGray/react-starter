import koaHelmet from 'koa-helmet'
import bodyParser from 'koa-body'
import kcompose from 'koa-compose'
import { ApolloServer } from 'apollo-server-koa'
import send from 'koa-send'
import SSR from './SSR'
import schema from './schema'

const { PUBLIC_DIR } = process.env

async function log(ctx, next) {
  await next()
  const rt = ctx.response.get('X-Response-Time')
  console.log(`${ctx.method} ${ctx.url} ${ctx.status} - ${rt}`)
}

async function time(ctx, next) {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
}

async function staticFiles(ctx, next) {
  try {
    if (ctx.path !== '/') {
      return await send(ctx, ctx.path, { root: PUBLIC_DIR })
    }
  } catch (e) {
    /* fallthrough */
  }
  return next()
}

export default function app() {
  const apolloServer = new ApolloServer({
    schema,
    subscriptions: {
      path: '/subscriptions',
      onConnect: (connection, websocket, context) => {
        console.log({ connection, websocket, context })
      },
    },
  })

  return kcompose([
    koaHelmet(),
    bodyParser(),
    log,
    time,
    staticFiles,
    apolloServer.getMiddleware(),
    SSR(),
  ])
}
