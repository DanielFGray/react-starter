import React from 'react'

export default function NotFound({ router: { location: { pathname } } }) {
  return (
    <p>
      {pathname}
      {' '}
      does not exist
    </p>
  )
}
