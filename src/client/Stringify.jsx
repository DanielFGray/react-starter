import React from 'react'

export default function Stringify(props) {
  return (
    <pre>
      {JSON.stringify(props, null, 2)}
    </pre>
  )
}
