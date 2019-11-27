export default async function dev() {
  const webpack = require('webpack')
  const koaWebpack = require('koa-webpack')
  const config = require('../webpack.config')
  const WebpackBar = require('webpackbar')

  const clientCompiler = webpack(config.find(c => c.name === 'client'))

  new WebpackBar({
    basic: true,
  }).apply(clientCompiler)

  return koaWebpack({
    compiler: clientCompiler,
    devMiddleware: {
      serverSideRender: true,
      stats: {
        chunks: true,
        chunkModules: false,
        colors: true,
        modules: false,
        children: false,
      },
    },
  })
 }
