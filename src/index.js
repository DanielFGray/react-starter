import 'dotenv/config'
import { promises as fs } from 'fs'
import Koa from 'koa'
import app from './app'

const { NODE_ENV } = process.env
const { PORT, HOST } = process.env

function die(e) {
  console.error(e)
  process.exit(1)
}

process.on('exit', () => die('exiting!'))
process.on('SIGINT', () => die('interrupted!'))
process.on('uncaughtException', die)

async function startServer(cb) {
  let server
  const { HTTPS_CERT, HTTPS_KEY } = process.env
  if (HTTPS_CERT && HTTPS_KEY) {
    const [http2, cert, key] = await Promise.all([
      import('http2'),
      fs.readFile(HTTPS_CERT, 'utf8'),
      fs.readFile(HTTPS_KEY, 'utf8'),
    ])
    server = http2.createSecureServer({ key, cert }, cb)
  } else {
    const http = await import('http')
    server = http.createServer(cb)
  }

  await new Promise(res => server.listen(Number(PORT), HOST, res))
  return server
}

async function main() {
  const koa = new Koa()

  if (NODE_ENV === 'development') {
    await (await import('./dev')).dev(koa)
  } else {
    const manifest = JSON.parse(await fs.readFile('./dist/manifest.json', 'utf8'))
    koa.use(async (ctx, next) => {
      ctx.state.manifest = manifest
      await next()
    })
  }

  koa.use(app)

  await startServer(koa.callback())
  console.info(`server now running on http://${HOST}:${PORT}`)
}
main()
