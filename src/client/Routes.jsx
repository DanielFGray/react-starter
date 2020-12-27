import * as React from 'react'
import { Switch, Route } from 'react-router-dom'
import Main from './Main'
import NotFound from './NotFound'


const Routes = props => (
  <Switch>
    {[
      {
        path: '/',
        exact: true,
        component: Main,
      },
      { path: '*', component: NotFound },
    ].map(({ path, exact, component: C }) => (
      <Route
        key={path || 'notfound'}
        path={path}
        exact={exact}
        render={({ ...routerProps }) => <C {...routerProps} {...props} />}
      />
    ))}
  </Switch>
)

export default Routes
