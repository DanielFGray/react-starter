import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import { Switch, Route } from 'react-router-dom'
import Nav from './Nav'
import Footer from './Footer'
import Main from './Main'
import NotFound from './NotFound'

const { APP_TITLE, NODE_ENV } = process.env

const routes = [
  {
    label: 'Home',
    path: '/',
    component: Main,
  },
  {
    component: NotFound,
  },
]

const links = routes.filter(x => x.label)


export default function Layout () {
  return (
    <div className="layout">
      <Helmet
        defaultTitle={APP_TITLE}
        titleTemplate={`${APP_TITLE} | %s`}
      />
      <Nav routes={links} />
      <div className="main">
        <Switch>
          {routes.map(({ path, exact, component: C }) => (
            <Route
              key={path || 'notfound'}
              path={path}
              exact={exact}
              render={router => <C {...router} />}
            />
          ))}
        </Switch>
      </div>
      <Footer />
    </div>
  )
}

if (module.hot) {
  console.info('HMR enabled')
}
