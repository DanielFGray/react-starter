import * as React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import Html from './Html'
import Routes from './client/Routes'
import Layout from './client/Layout'

export default function SSR({ appBase, getData }) {
  return async ctx => {
    const routerCtx = {}
    const helmetCtx = {}

    const Init = props => (
      <StaticRouter
        basename={appBase}
        location={ctx.url}
        context={routerCtx}
      >
        <HelmetProvider context={helmetCtx}>
          <Layout>
            <Routes {...props} />
          </Layout>
        </HelmetProvider>
      </StaticRouter>
    )

    const data = await getData(ctx.url)

    const html = renderToString(<Init initData={data} />)
    const { helmet } = helmetCtx

    if (routerCtx.status) {
      ctx.status = routerCtx.status
    }

    if (routerCtx.url) {
      ctx.redirect(routerCtx.url)
      return
    }

    ctx.body = `<!doctype html>${renderToStaticMarkup(Html({ data, helmet, html }))}`
  }
}
