/* eslint-disable import/no-extraneous-dependencies, global-require */
import webpack from 'webpack'
import koaWebpack from 'koa-webpack'
import WebpackBar from 'webpackbar'
import config from '../webpack.config'
import hotServerMiddleware from './hotServerMiddleware'

export async function dev() {
  const multiCompiler = webpack(config)
  const clientCompiler = multiCompiler.compilers.find(c => c.name === 'client')

  new WebpackBar({ profile: true })
    .apply(clientCompiler)

  multiCompiler.compilers.forEach(c => {
    c.hooks.done.tap('built', () => {
      console.log(`${c.name} finished building`)
    })
  })

  return {
    hotServerMiddleware,
    koaWebpack: await koaWebpack({
      compiler: clientCompiler,
      devMiddleware: {
        serverSideRender: true,
        logLevel: 'trace',
        // stats: false,
        stats: {
          chunks: true,
          chunkModules: false,
          colors: true,
          modules: false,
          children: false,
        },
      },
    }),
  }
}
