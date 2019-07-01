import * as React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import Html from './Html'
import Routes from './client/Routes'
import Layout from './client/Layout'

export default ({ appBase, data }) => async ctx => {
  if (typeof data === 'function') {
    data = data() // eslint-disable-line no-param-reassign
  }
  const routerCtx = {}
  const helmetCtx = {}
  const App = (
    <StaticRouter
      basename={appBase}
      location={ctx.url}
      context={routerCtx}
    >
      <HelmetProvider context={helmetCtx}>
        <Layout>
          <Routes data={data} />
        </Layout>
      </HelmetProvider>
    </StaticRouter>
  )
  const html = renderToString(App)
  const { helmet } = helmetCtx
  const body = renderToStaticMarkup(Html({ data, helmet, html }))
  if (routerCtx.status) {
    ctx.status = routerCtx.status
  }
  if (routerCtx.url) {
    ctx.redirect(routerCtx.url)
  } else {
    ctx.body = `<!doctype html>${body}`
  }
}
