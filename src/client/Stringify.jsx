import React from 'react'

export default function Stringify(data) {
  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )
}
