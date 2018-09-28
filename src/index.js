/* global __non_webpack_require__:false */
/* eslint-disable no-console */
import * as React from 'react'
import { StaticRouter } from 'react-router'
import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import expressHelmet from 'helmet'
import { HelmetProvider } from 'react-helmet-async'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import Html from './Html'
import Routes from './client/Routes'
import Layout from './client/Layout'

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

const getData = () => Promise.resolve({ list: [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }] })

app.get('/api/v1', async (req, res) => {
  const body = await getData()
  res.json({ status: 'ok', body })
})

app.get('/api*', (req, res) => {
  res.status(500)
    .json({ status: 'error', body: 'not implemented' })
})

app.get('/', (req, res) => {
  getData().then(data => {
    const routerCtx = {}
    const helmetCtx = {}
    const children = (
      <StaticRouter basename={appBase} location={req.url} context={routerCtx}>
        <HelmetProvider context={helmetCtx}>
          <Layout>
            <Routes data={data} />
          </Layout>
        </HelmetProvider>
      </StaticRouter>
    )
    let html = renderToString(children)
    const { helmet } = helmetCtx
    html = renderToStaticMarkup(Html({ data, helmet, html }))
    if (routerCtx.url) {
      res.writeHead(302, {
        Location: routerCtx.url,
      })
      res.end()
    } else {
      res.end(html)
    }
  })
    .catch(e => {
      console.error(e)
      res.status(501)
        .json(e)
    })
})

app.listen(port, host, () => console.log(`
  server now running on http://${host}:${port}`))

process.on('uncaughtException', console.error)
process.on('exit', () => console.log('exiting!'))
process.on('SIGINT', () => console.log('interrupted!'))

export default app
