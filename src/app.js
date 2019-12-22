import Router from 'koa-router'
import bodyParser from 'koa-body'
import send from 'koa-send'
import kcompose from 'koa-compose'
import koaHelmet from 'koa-helmet'
import SSR from './SSR'

const {
  APP_BASE,
  PUBLIC_DIR,
} = process.env

export default function app() {

  const router = new Router()
    .all('/ping', async ctx => {
      ctx.body = 'pong'
    })

    .get('/api/v1/test', async ctx => {
      ctx.body = { status: 'ok', body: 'hello world' }
    })

    .all(['/api', '/api/*'], async ctx => {
      ctx.status = 500
      ctx.body = { status: 'error', body: 'not implemented' }
    })

    .get('/*', SSR({ appBase: APP_BASE }))


  async function errHandler(ctx, next) {
    try {
      await next()
    } catch (e) {
      console.error(e)
      ctx.status = 500
      ctx.body = 'Internal Server Error'
    }
  }

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

  return kcompose([
    koaHelmet(),
    bodyParser(),
    errHandler,
    log,
    time,
    staticFiles,
    router.allowedMethods(),
    router.routes(),
  ])
}
