import 'dotenv/config'
import { promises as fs } from 'fs'
import Koa from 'koa'
import { SubscriptionServer } from 'subscriptions-transport-ws'
import { execute, subscribe } from 'graphql'
import app from './app'
import { schema } from './resolvers'

const {
  NODE_ENV: nodeEnv,
  PORT,
  HOST,
} = process.env

function die(e) {
  if (e) console.error(e)
  process.exit(1)
}

process.on('exit', () => die('exiting!'))
process.on('SIGINT', () => die('interrupted!'))
process.on('uncaughtException', die)

async function main() {
  const koa = new Koa()

  if (nodeEnv !== 'development') {
    const manifest = JSON.parse(await fs.readFile('./dist/manifest.json', 'utf8'))
    koa.use(async (ctx, next) => {
      ctx.state.manifest = manifest
      await next()
    })
  } else {
    const { dev } = await import('./dev')
    koa.use(await dev())
  }

  koa.use(await app({ app: koa, schema }))

  const server = (await import('http')).createServer(koa.callback())
  await new Promise(res => server.listen(Number(PORT), HOST, res))
  console.info(`server now running on http://${HOST}:${PORT}`)
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
}
main().catch(die)
