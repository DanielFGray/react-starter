import Main from './client/Main'
import BlogPost from './client/BlogPost'
import NotFound from './client/NotFound'

export default [
  {
    path: '/blog/:category/:filename',
    component: BlogPost,
  },
  {
    path: '/blog/tags',
    component: BlogPost,
  },
  {
    path: '/blog/:filename',
    component: BlogPost,
  },
  {
    label: 'Blog',
    path: '/blog',
    component: BlogPost,
    exact: true,
  },
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
