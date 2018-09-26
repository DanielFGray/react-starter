import * as React from 'react'
import Helmet from 'react-helmet-async'
import Stringify from './Stringify'

const Main = props => (
  <div>
    <Helmet>
      <title>Home</title>
    </Helmet>
    <Stringify {...props} />
  </div>
)

export default Main
