import morgan from 'koa-morgan'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import send from 'koa-send'
import kcompose from 'koa-compose'
import helmet from 'koa-helmet'
import SSR from './SSR'

const {
  APP_BASE: appBase,
  NODE_ENV,
  PUBLIC_DIR,
} = process.env

const isDev = NODE_ENV.startsWith('dev')

const router = new Router()
router.all('/ping', async ctx => {
  ctx.body = 'pong'
})

router.get('/api/v1/test', async ctx => {
  ctx.body = { status: 'ok', body: 'hello world' }
})

router.all('/api/:unknown*', async ctx => {
  ctx.status = 500
  ctx.body = { status: 'error', body: `endpoint ${ctx.params.unknown ?? '/'} not implemented` }
})

router.get('/:path*', SSR)

async function forceJson(ctx, next) {
  if (ctx.path.startsWith('/api')) {
    ctx.set('Content-Type', 'application/json')
  }
  return next()
}

async function staticFiles(ctx, next) {
  try {
    if (ctx.path !== '/') {
      return await send(ctx, ctx.path, { root: PUBLIC_DIR })
    }
  } catch (e) { /* fallthrough */ }
  return next()
}

export default kcompose([
  ...(isDev ? [] : [helmet()]),
  morgan(isDev ? 'common' : 'combined'),
  bodyParser(),
  staticFiles,
  router.allowedMethods(),
  router.routes(),
  forceJson,
])
