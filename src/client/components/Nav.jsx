import * as React from 'react'
import { NavLink } from 'react-router-dom'

// https://reacttraining.com/react-router/web/api/NavLink

const links = [
  { label: 'Home', path: '' },
]

const Nav = () => (
  <nav className="nav">
    <ul>
      {links.map(({ label, path }) => (
        <li key={`${label}_${path}`}>
          <NavLink to={path}>
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
)

export default Nav
