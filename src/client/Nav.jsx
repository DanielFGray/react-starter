import * as React from 'react'
import { NavLink } from 'react-router-dom'
import { has } from 'ramda'

// https://reacttraining.com/react-router/web/api/NavLink

const Nav = ({ routes }) => (
  <nav className="nav">
    <ul>
      {routes.map(({ label, path }) => (
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
