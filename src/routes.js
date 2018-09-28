import Main from './client/Main'
import NotFound from './client/NotFound'

export default [
  {
    label: 'Home',
    path: '/',
    exact: true,
    component: Main,
  },
  {
    component: NotFound,
  },
]
