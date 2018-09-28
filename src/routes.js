const Main = require('./client/Main')
const NotFound = require('./client/NotFound')

module.exports = [
  {
    label: 'Home',
    path: '/',
    exact: true,
    component: Main.default,
  },
  {
    component: NotFound.default,
  },
]
