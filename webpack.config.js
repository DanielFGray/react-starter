/* eslint-disable import/no-extraneous-dependencies,global-require */

const HtmlWebpackPlugin = require('html-webpack-plugin')
const { DefinePlugin } = require('webpack')
const merge = require('webpack-merge')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const config = require('./config.js')

const constants = Object.entries(config)
  .map(([k, v]) => [`__${k}`, JSON.stringify(v)])
  .reduce((p, [k, v]) => Object.assign(p, { [k]: v }), {})

const rules = [
  {
    test: /node_modules[\\/].*\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
    ],
  },
  {
    exclude: /node_modules/,
    test: /\.(s|c)ss$/,
    use: [
      MiniCssExtractPlugin.loader,
      'css-loader',
      'postcss-loader',
    ],
  },
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
        },
      },
    ],
  },
]

const plugins = [
  new HtmlWebpackPlugin({
    template: 'src/client/html.ejs',
    inject: false,
    title: config.appTitle,
    appMountId: config.mount,
    mobile: true,
  }),
  new DefinePlugin(constants),
  new MiniCssExtractPlugin()
]

const stats = {
  chunks: false,
  modules: false,
  colors: true,
}

const clientConfig = {
  name: 'client',
  mode: config.nodeEnv,
  entry: { main: './src/client/index' },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  output: {
    path: config.publicDir,
    filename: config.devMode ? '[name].js' : '[name]-[hash].js',
  },
  module: {
    rules,
  },
  plugins,
  stats,
}

if (config.devMode) {
  const webpackServeWaitpage = require('webpack-serve-waitpage')
  const history = require('connect-history-api-fallback')
  const convert = require('koa-connect')
  module.exports = merge(clientConfig, {
    serve: {
      port: config.port,
      host: config.host,
      devMiddleware: {
        stats,
      },
      add(app, middleware, options) {
        app.use(convert(history({
          /* https://github.com/bripkens/connect-history-api-fallback#options */
        })))
        app.use(webpackServeWaitpage(options))
      },
    },
  })
} else {
  module.exports = merge(clientConfig, {
    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].[hash].css',
      }),
    ],
  })
}
