import React from 'react'

const Stringify = data => (
  <pre>{JSON.stringify(data, null, 2)}</pre>
)

export default Stringify
