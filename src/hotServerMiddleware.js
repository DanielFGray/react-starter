
/*
  Forked from https://github.com/60frames/webpack-hot-server-middleware
  and modified for Typescript and Launch.js

  MIT License

  Copyright (c) 2016 [note: no attribution given]

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

// ----------------------------------------------------------------------------
// IMPORTS

/* Node */
import path from 'path'

/* NPM */
import requireFromString from 'require-from-string'
import sourceMapSupport from 'source-map-support'

const OutputConfig = new WeakMap()

class Output {
  constructor(c) {
    OutputConfig.set(this, c)
  }

  /* GETTERS */

  // Return the Webpack client build stats
  get client() {
    return OutputConfig.get(this).client
  }

  // Return the Webpack server build stats
  get server() {
    return OutputConfig.get(this).server
  }
}

const StatsConfig = new WeakMap()

class Stats {
  constructor(stats) {
    StatsConfig.set(this, stats)
  }

  get raw() {
    return StatsConfig.get(this)
  }

  main(ext) {
    const main = StatsConfig.get(this)?.assetsByChunkName?.main ?? []
    const file = (Array.isArray(main) ? main : [main]).find(c => c.endsWith(`.${ext}`))
    return file && `/${file}`
  }

  scripts() {
    const initial = this.raw.chunks.find(chunk => chunk.initial)

    const scripts = initial.siblings
      .map(sibling => this.raw.chunks.find(chunk => chunk.id === sibling))
      .map(sibling => sibling.files)
      .concat(initial.files)
      .flat()
      .filter(file => file.endsWith('.js'))
      .map(file => `/${file}`)

    return scripts
  }
}

// ----------------------------------------------------------------------------

// Create a Koa handler
const createKoaHandler = (error, serverRenderer) => (ctx, next) => {
  if (error) {
    ctx.throw(error)
  }
  return serverRenderer(ctx, next)
}

function isMultiCompiler(compiler) {
  // Duck typing as `instanceof MultiCompiler` fails when npm decides to
  // install multiple instances of webpack.
  return compiler && compiler.compilers
}

function findCompiler(multiCompiler, name) {
  return multiCompiler.compilers.filter(compiler => compiler.name.indexOf(name) === 0)
}

function findStats(multiStats, name) {
  return multiStats.stats.filter(stats => stats.compilation.name.indexOf(name) === 0)
}

function getFilename(serverStats, outputPath) {
  const { assetsByChunkName } = serverStats.toJson()
  const filename = (assetsByChunkName && assetsByChunkName.main) || ''
  // If source maps are generated `assetsByChunkName.main`
  // will be an array of filenames.
  return path.join(
    outputPath,
    Array.isArray(filename)
      ? filename.find(asset => /\.js$/.test(asset))
      : filename,
  )
}

function getServerRenderer(filename, buffer, output) {
  const errMessage = 'The "server" compiler must export a function in the form of `(output: Output) => (ctx: Koa.Context, next: () => Promise<any>) => void`'

  const outputRenderer = requireFromString(
    buffer.toString(),
    filename,
  ).default
  if (typeof outputRenderer !== 'function') {
    throw new Error(errMessage)
  }

  const serverRenderer = outputRenderer(output)
  if (typeof serverRenderer !== 'function') {
    throw new Error(errMessage)
  }

  return serverRenderer
}

function installSourceMapSupport(filesystem) {
  sourceMapSupport.install({
    // NOTE: If https://github.com/evanw/node-source-map-support/pull/149
    // lands we can be less aggressive and explicitly invalidate the source
    // map cache when Webpack recompiles.
    emptyCacheBetweenOperations: true,
    retrieveFile(source) {
      try {
        return filesystem.readFileSync(source, 'utf8')
      } catch (ex) {
        // Doesn't exist
        return ''
      }
    },
  })
}

/**
 * Passes the request to the most up to date 'server' bundle.
 * NOTE: This must be mounted after webpackDevMiddleware to ensure this
 * middleware doesn't get called until the compilation is complete.
 */
export default function webpackHotServerMiddleware(multiCompiler) {
  if (! isMultiCompiler(multiCompiler)) {
    throw new Error(
      'Expected webpack compiler to contain both a "client" and/or "server" config',
    )
  }

  const serverCompiler = findCompiler(multiCompiler, 'server')[0]
  const clientCompilers = findCompiler(multiCompiler, 'client')

  const outputFs = serverCompiler.outputFileSystem
  const { outputPath } = serverCompiler

  installSourceMapSupport(outputFs)

  let serverRenderer
  let error = false

  const doneHandler = multiStats => {
    error = false

    const serverStats = findStats(multiStats, 'server')[0]
    // Server compilation errors need to be propagated to the client.
    if (serverStats.compilation.errors.length) {
      error = serverStats.compilation.errors[0]
      return
    }

    let clientStatsJson = null

    if (clientCompilers.length) {
      const clientStats = findStats(multiStats, 'client')
      clientStatsJson = clientStats.map(obj => obj.toJson())

      if (clientStatsJson.length === 1) {
        clientStatsJson = clientStatsJson[0]
      }
    }

    const filename = getFilename(serverStats, outputPath)
    const buffer = outputFs.readFileSync(filename)

    // Create an `Output` instance, containing our client/server stats
    const output = new Output({
      client: new Stats(clientStatsJson),
      server: new Stats(serverStats.toJson()),
    })

    try {
      serverRenderer = getServerRenderer(filename, buffer, output)
    } catch (ex) {
      error = ex
    }
  }

  // Webpack 4
  multiCompiler.hooks.done.tap(
    'WebpackHotServerMiddleware',
    doneHandler,
  )

  return createKoaHandler(error, serverRenderer)
}
