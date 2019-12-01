import 'dotenv/config'
import { promises as fs } from 'fs'
import Koa from 'koa'
import app from './app'

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
  return (HTTPS_CERT && HTTPS_KEY
    ? Promise.all([
      import('http2'),
      fs.readFile(HTTPS_CERT, 'utf8'),
      fs.readFile(HTTPS_KEY, 'utf8'),
    ]).then(([http2, cert, key]) => http2.createSecureServer({ key, cert }, cb))
    : import('http').then(http => http.createServer(cb)))
    .then(server => new Promise(res => server.listen(Number(port), host, res)))
}

(async function main() {
  const koa = new Koa()

  let pre, post // FIXME this is terrible
  if (nodeEnv !== 'development') {
    const manifest = JSON.parse(await fs.readFile('./dist/manifest.json', 'utf8'))
    pre = async (ctx, next) => {
      ctx.state.manifest = manifest
      await next()
    }
  } else {
    const dev = await import('./dev')
    const { hotServerMiddleware, koaWebpack } = await dev.default()
    pre = koaWebpack
    post = hotServerMiddleware
  }

  if (pre) koa.use(pre)
  koa.use(app({ appBase, publicDir }))
  if (post) koa.use(post)

  await startServer(koa.callback())
  console.info(`server now running on http://${host}:${port}`)
}())
