/* global __non_webpack_require__:false */
/* eslint-disable no-console */
import Koa from 'koa'
import Router from 'koa-router'
import bodyParser from 'koa-body'
import send from 'koa-send'
import koaHelmet from 'koa-helmet'
import SSR from './SSR'

const {
  appBase,
  host,
  port,
  publicDir,
} = __non_webpack_require__('../config')

const data = () => ({
  list: [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }],
  seed: Math.random(),
})

const router = new Router()
  .all('/ping', async ctx => {
    ctx.body = 'pong'
  })

  .get('/api/v1', async ctx => {
    ctx.body = { status: 'ok', body: data() }
  })

  .all('/api*', async ctx => {
    ctx.status = 500
    ctx.body = { status: 'error', body: 'not implemented' }
  })

  .get(['/', '/*'], SSR({ data, appBase }))

const app = new Koa()

  .use(koaHelmet())
  .use(bodyParser())

  .use(async (ctx, next) => {
    try {
      await next()
    }
    catch (e) {
      ctx.status = 500
      ctx.body = 'Internal Server Error'
    }
  })

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
    if (ctx.path.startsWith('/api')) {
      ctx.set('Content-Type', 'application/json')
    }
    return next()
  })

  .use(async (ctx, next) => {
    try {
      if (ctx.path !== '/') {
        return await send(ctx, ctx.path, { root: publicDir })
      }
    } catch (e) { /* fallthrough */ }
    return next()
  })

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
