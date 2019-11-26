import * as React from 'react'
import { Switch, Route } from 'react-router-dom'
import Main from './Main'
import NotFound from './NotFound'

const Routes = props => (
  <Switch>
    {[
      {
        label: 'Home',
        path: '/',
        exact: true,
        component: Main,
      },
      {
        component: NotFound,
      },
    ].map(({ path, exact, component }) => (
      <Route
        key={path || 'notfound'}
        path={path}
        exact={exact}
        render={({ match, location, history }) => React.createElement(component, {
          ...props,
          history,
          location,
          match,
        })}
      />
    ))}
  </Switch>
)

export default Routes
