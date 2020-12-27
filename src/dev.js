/* eslint-disable import/no-extraneous-dependencies, global-require */
import path from 'path'
import webpack from 'webpack'
import chokidar from 'chokidar'
import koaWebpack from 'koa-webpack'
// import WebpackBar from 'webpackbar'
import config from '../webpack.config'
// import hotServerMiddleware from './hotServerMiddleware'

// eslint-disable-next-line import/prefer-default-export
export async function dev(app) {
  const clientWatcher = chokidar.watch('./client/**/*')
  clientWatcher.on('change', e => {
    console.log(e)
    Object.keys(require.cache)
      .filter(x => x.startsWith(path.resolve(__dirname, 'client')))
      .forEach(x => {
        delete require.cache[x]
      })
  })

  const multiCompiler = webpack(config)
  const clientCompiler = multiCompiler.compilers.find(c => c.name === 'client')

  // new WebpackBar({ profile: true })
  //   .apply(clientCompiler)

  multiCompiler.compilers.forEach(c => {
    c.hooks.done.tap('built', () => {
      console.log(`${c.name} finished building`)
    })
  })

  return app.use(
    await koaWebpack({
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
  )
}
