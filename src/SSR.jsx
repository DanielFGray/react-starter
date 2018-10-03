import * as React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import Html from './Html'
import Routes from './client/Routes'
import Layout from './client/Layout'

export default ({ appBase, getData }) => (req, res) => {
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
    if (routerCtx.status) {
      res.status(routerCtx.status)
    }
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
      process.exit(1)
    })
}
