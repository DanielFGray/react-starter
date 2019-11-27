import * as React from 'react'
import { Helmet } from 'react-helmet-async'
import GetJson from './GetJson'

const Stringify = data => <pre>{JSON.stringify(data, null, 2)}</pre>

const Main = ({ router, ...props }) => (
  <>
    <Helmet>
      <title>Home</title>
    </Helmet>
    <GetJson url="https://randomuser.me/api">
      {({ error, loading, reload, data }) => {
        if (error) {
          console.error(error)
        }
        return (
          <div>
            <div>
              <button onClick={reload}>
                Reload
              </button>
            </div>
            <div>
              {Stringify({ loading, props, data, router })}
            </div>
          </div>
        )
      }}
    </GetJson>
  </>
)

export default Main
