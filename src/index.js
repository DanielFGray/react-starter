import 'dotenv/config'
import { promises as fs } from 'fs'
import Koa from 'koa'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import app from './app'
import schema from './schema'

const {
  NODE_ENV: nodeEnv,
  PORT: port,
  HOST: host,
  APP_BASE: appBase,
  PUBLIC_DIR: publicDir,
} = process.env

function die(e) {
  console.error(e)
  process.exit(1)
}

process.on('exit', () => die('exiting!'))
process.on('SIGINT', () => die('interrupted!'))
process.on('uncaughtException', die)

async function startServer(cb) {
  const { HTTPS_CERT, HTTPS_KEY } = process.env
  let server
  if (HTTPS_CERT && HTTPS_KEY) {
    const [http2, cert, key] = await Promise.all([
      import('http2'),
      fs.readFile(HTTPS_CERT, 'utf8'),
      fs.readFile(HTTPS_KEY, 'utf8'),
    ])
    server = http2.createSecureServer({ key, cert }, cb)
  }

  const http = await import('http')
  server = http.createServer(cb)

  await new Promise(res => server.listen(Number(port), host, res))
  return server
}

(async function main() {
  const koa = new Koa()

  let pre // FIXME this is all terrible
  let post
  if (nodeEnv !== 'development') {
    const manifest = JSON.parse(await fs.readFile('./dist/manifest.json', 'utf8'))
    pre = async (ctx, next) => {
      ctx.state.manifest = manifest
      await next()
    }
  } else {
    const { dev } = await import('./dev')
    const { hotServerMiddleware, koaWebpack } = await dev()
    pre = koaWebpack
    post = hotServerMiddleware
  }

  if (pre) koa.use(pre)
  koa.use(app({ appBase, publicDir }))
  if (post) koa.use(post)

  const server = await startServer(koa.callback())
  console.info(`server now running on http://${host}:${port}`)
  SubscriptionServer.create(
    {
      execute,
      subscribe,
      schema,
    },
    {
      server,
      path: '/subscriptions',
    },
  )
}())
