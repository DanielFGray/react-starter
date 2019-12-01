module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
      },
      loose: true,
      useBuiltIns: 'usage',
      corejs: 3,
    }],
    '@babel/preset-react',
  ],
  plugins: [
    'babel-plugin-graphql-tag',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    // ['@babel/plugin-proposal-pipeline-operator', { proposal: 'fsharp' }],
    // '@babel/plugin-proposal-do-expressions',
    // '@babel/plugin-proposal-throw-expressions',
    // ['@babel/plugin-proposal-class-properties', { loose: true }],
    // '@babel/plugin-syntax-dynamic-import',
    // ['@babel/plugin-proposal-decorators', { legacy: true }],
  ],
  env: {
    development: {
      plugins: [],
    },
    production: {
      plugins: [
        'ramda',
      ],
    },
  },
}
