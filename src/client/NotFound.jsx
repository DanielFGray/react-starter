import * as React from 'react'
import { Helmet } from 'react-helmet-async'

const NotFound = props => {
  if (props.staticContext) {
    // eslint-disable-next-line no-param-reassign
    props.staticContext.status = 404
  }
  return (
    <p>
      <Helmet>
        <title>Not Found</title>
      </Helmet>
      {`${props.location.pathname} does not exist`}
    </p>
  )
}

export default NotFound
