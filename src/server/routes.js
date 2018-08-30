/* eslint react/jsx-filename-extension: off */
import { Router } from 'express'
import * as React from 'react'
import StaticRouter from 'react-router-dom/StaticRouter'
import { renderRoutes } from 'react-router-config'
import Html from './Html'
import routes from '../routes'
import { appBase } from '../../config'

const router = Router()

const getData = () => Promise.resolve({ list: [{ id: 1, name: 'foo' }, { id: 2, name: 'bar' }] })

router.get('/api/v1', async (req, res) => {
  const body = await getData()
  res.json({ status: 'ok', body })
})

router.get('/api*', (req, res) => {
  res.status(500)
    .json({ status: 'error', body: 'not implemented' })
})

router.get('/', (req, res) => {
  getData().then(data => {
    const context = data
    const app = (
      <StaticRouter basename={appBase} location={req.url} context={context}>
        {renderRoutes(routes)}
      </StaticRouter>
    )
    try {
      const x = Html({ data, children: app })
      if (context.url) {
        res.writeHead(302, {
          Location: context.url,
        })
        res.end()
      } else {
        res.end(x)
      }
    } catch (e) {
      console.error(e)
      res.status(501)
        .json(e)
    }
  })
})

export default router