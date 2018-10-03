/* global __non_webpack_require__:false */
/* eslint-disable no-console */
import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import expressHelmet from 'helmet'
import SSR from './SSR'

const config = __non_webpack_require__('../config')

const {
  appBase,
  host,
  port,
  publicDir,
} = config

const app = express()

app.use(morgan('dev'))
app.use(expressHelmet())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(publicDir))

const getData = () => Promise.resolve({ list: [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }], seed: Math.random() })

app.get('/api/v1', async (req, res) => {
  const body = await getData()
  res.json({ status: 'ok', body })
})

app.get('/api*', (req, res) => {
  res.status(500)
    .json({ status: 'error', body: 'not implemented' })
})

app.get('/*', SSR({ appBase, getData }))

app.listen(port, host, () => console.log(`
  server now running on http://${host}:${port}`))

process.on('uncaughtException', e => {
  console.error(e)
  process.exit(1)
})
process.on('exit', () => console.log('exiting!'))
process.on('SIGINT', () => console.log('interrupted!'))

export default app
