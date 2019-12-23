import React from 'react'
import { renderToStringWithData } from '@apollo/react-ssr'
import { StaticRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { ApolloProvider } from '@apollo/react-hooks'
import { ApolloClient } from 'apollo-client'
import { SchemaLink } from 'apollo-link-schema'
import { InMemoryCache } from 'apollo-cache-inmemory'
import Layout from './client/Layout'
import * as Html from './Html'

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

export default async function SSR(ctx) {
  const { styles, scripts } = getAssets(ctx)
  const client = new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link: new SchemaLink({ schema }),
  })
  const routerCtx = {}
  const helmetCtx = {}

  const App = (
    <ApolloProvider client={client}>
      <StaticRouter
        basename={APP_BASE}
        location={ctx.url}
        context={routerCtx}
      >
        <HelmetProvider context={helmetCtx}>
          <Layout />
        </HelmetProvider>
      </StaticRouter>
    </ApolloProvider>
  )

  const html = await renderToStringWithData(App)
  const { helmet } = helmetCtx
  const data = { __INIT_DATA: client.extract() }

  if (routerCtx.statusCode) {
    ctx.status = routerCtx.statusCode
  }
  if (routerCtx.url) {
    ctx.redirect(routerCtx.url)
    return
  }
  ctx.body = Html.toString({
    data,
    helmet,
    html,
    styles,
    scripts,
  })
}

if (module.hot) {
  console.info('server side HMR')
}
