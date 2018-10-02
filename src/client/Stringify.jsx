import * as React from 'react'

const Stringify = props => (
  <pre>
    {JSON.stringify(props, null, 2)}
  </pre>
)
export default Stringify
