import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { HelmetProvider } from 'react-helmet-async'
import { ApolloProvider, renderToStringWithData } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { SchemaLink } from 'apollo-link-schema'
import { InMemoryCache } from 'apollo-cache-inmemory'
import Html from './Html'
import Routes from './client/Routes'
import Layout from './client/Layout'

export default ({ appBase, schema }) => async ctx => {
  const client = new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link: new SchemaLink({ schema }),
  })

  const helmetCtx = {}
  const routerCtx = {}
  const App = (
    <ApolloProvider client={client}>
      <StaticRouter
        basename={appBase}
        location={ctx.url}
        context={routerCtx}
      >
        <HelmetProvider context={helmetCtx}>
          <Layout>
            <Routes />
          </Layout>
        </HelmetProvider>
      </StaticRouter>
    </ApolloProvider>
  )

  const html = await renderToStringWithData(App)
  const { helmet } = helmetCtx
  const data = client.extract()
  const page = renderToStaticMarkup(Html({ data, helmet, html }))

  if (routerCtx.url) {
    ctx.redirect(routerCtx.url)
    return
  }
  ctx.body = `<!doctype html>${page}`
}
