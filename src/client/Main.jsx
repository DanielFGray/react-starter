import React from 'react'
import GetJson from './GetJson'

const Stringify = data => <pre>{JSON.stringify(data, null, 2)}</pre>

const Main = ({ router, rootData }) => (
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
            {Stringify({ loading, rootData, data, router })}
          </div>
        </div>
      )
    }}
  </GetJson>
)

export default Main
