/* eslint-disable import/no-extraneous-dependencies,global-require */
module.exports = {
  plugins: [
    require('postcss-preset-env')({ stage: 1 }),
    require('postcss-fixes')({ preset: 'recommended' }),
  ],
  env: {
    production: {
      cssnano: {
        autoprefixer: false,
        safe: true,
        calc: false,
      },
    },
  },
}
