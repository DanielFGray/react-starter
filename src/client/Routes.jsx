import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { has } from 'ramda'
import Nav from './Nav'
import routes from '../routes'

const links = routes
  .filter(has('label'))
  .map(({ label, path }) => ({ label, path }))

const Routes = rootData => (
  <div>
    <Nav links={links} />
    <Switch>
      {routes.map(({ path, exact, component: C }) => (
        <Route
          key={path}
          path={path}
          exact={exact}
          render={router => <C router={router} rootData={rootData} />}
        />
      ))}
    </Switch>
  </div>
)

export default Routes
