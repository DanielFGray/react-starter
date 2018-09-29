import * as React from 'react'
import { NavLink } from 'react-router-dom'
import { has } from 'ramda'
import routes from '../routes'

// https://reacttraining.com/react-router/web/api/NavLink

const links = routes.filter(has('label'))

const Nav = () => (
  <nav className="nav">
    <ul>
      {links.map(({ label, path }) => (
        <li key={`${label}_${path}`}>
          <NavLink to={path} activeClassName="selected">
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
)

export default Nav
