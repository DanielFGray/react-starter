import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import * as Html from './Html'
import Layout from './client/Layout'

const { APP_BASE } = process.env

const getAssets = ctx => {
  const list = Object.values(
    process.env.NODE_ENV === 'production'
      ? ctx.state.manifest
      : ctx.state.webpackStats.toJson().assetsByChunkName.main,
  )
  return list.reduce((p, x) => {
    if (/\.css$/.test(x)) {
      p.styles.push(x)
    } else if (/\.js$/.test(x)) {
      p.scripts.push(x)
    }
    return p
  }, { styles: [], scripts: [] })
}

export default function SSR() {
  return async ctx => {
    try {
      const { styles, scripts } = getAssets(ctx)
      const routerCtx = {}
      const helmetCtx = {}

      const App = (
        <StaticRouter
          basename={APP_BASE}
          location={ctx.url}
          context={routerCtx}
        >
          <HelmetProvider context={helmetCtx}>
            <Layout />
          </HelmetProvider>
        </StaticRouter>
      )

      const html = await renderToString(App)
      const { helmet } = helmetCtx

      if (routerCtx.statusCode) {
        ctx.status = routerCtx.statusCode
      }
      if (routerCtx.url) {
        ctx.redirect(routerCtx.url)
        return
      }
      ctx.body = Html.toString({
        helmet,
        html,
        styles,
        scripts,
        appBase,
      })
    } catch (e) {
      ctx.status = 500
      ctx.body = 'Error'
      console.error(e)
      process.exit(1)
    }
  }
}
