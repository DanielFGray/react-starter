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
    ['import-graphql', { extensions: ['.gql'] }],
  ],
  env: {
    development: {
      plugins: [],
    },
    production: {
      plugins: [],
    },
  },
}
