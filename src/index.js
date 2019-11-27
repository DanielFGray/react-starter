import 'dotenv/config'
import http from 'http'
import app from './app'

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

;(async function main() {
  try {
    const koa = await app()

    if (NODE_ENV === 'development') {
      const webpack = require('webpack')
      const koaWebpack = require('koa-webpack')
      const config = require('../webpack.config').find(c => c.name === 'client')
      const compiler = webpack(config)

      koa.use(await koaWebpack({
        compiler,
        devMiddleware: {
          serverSideRender: {

          },
        },
      }))
    }

    const server = http.createServer(koa.callback())
    server
      .listen(PORT, HOST, () => console.info(`server now running on http://${HOST}:${PORT}`))
  } catch (e) {
    throw e
  }
})()
