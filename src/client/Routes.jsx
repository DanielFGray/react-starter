import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Main from './Main'
import NotFound from './NotFound'

export const routes = [
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

const Routes = props => (
  <Switch>
    {routes.map(({ path, exact, component: C }, i) => (
      <Route
        key={`${path}${i}`}
        path={path}
        exact={exact}
        render={router => <C router={router} {...props} />}
      />
    ))}
  </Switch>
)

export default Routes
