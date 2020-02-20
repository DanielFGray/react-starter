import Koa from 'koa'
import koaHelmet from 'koa-helmet'
import bodyParser from 'koa-body'
import koaSession from 'koa-session'
import { ApolloServer } from 'apollo-server-koa'
import send from 'koa-send'
import kcompose from 'koa-compose'
import SSR from './SSR'

const { SESSION_SECRET, PUBLIC_DIR } = process.env

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

export default async function main({ app, schema }) {
  if (! (app instanceof Koa)) throw new Error('expected koa, received: ', app || 'undefined')
  const apolloServer = new ApolloServer({
    schema,
    subscriptions: {
      path: '/subscriptions',
      onConnect: (connection, websocket, context) => {
        console.log({ connection, websocket, context })
      },
    },
  })

  // eslint-disable-next-line no-param-reassign
  app.keys = [SESSION_SECRET]
  const sessionConf = {
    key: 'nodeapp_session',
    rolling: true,
    renew: true,
  }

  return kcompose([
    koaHelmet(),
    bodyParser(),
    log,
    time,
    koaSession(sessionConf, app),
    staticFiles,
    apolloServer.getMiddleware(),
    SSR({ schema }),
  ])
}
