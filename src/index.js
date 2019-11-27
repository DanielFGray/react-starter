import 'dotenv/config'
import http from 'http'
import app from './app'
import Koa from 'koa'

const { NODE_ENV, PORT, HOST } = process.env

process.on('exit', () => console.log('exiting!'))
process.on('SIGINT', () => {
  console.log('interrupted!')
  process.exit(1)
})

process.on('uncaughtException', e => {
    console.error(e)
    process.exit(1)
})

async function main() {
  const koa = new Koa()

  if (NODE_ENV === 'development') koa.use(await require('./dev').default(koa))

  await app(koa)

  const server = http.createServer(koa.callback())
  await new Promise(res => { server.listen(PORT, HOST, res) })
  console.info(`server now running on http://${HOST}:${PORT}`)
}
main()
