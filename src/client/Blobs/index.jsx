import React from 'react'
import { Helmet } from 'react-helmet-async'
import Item from './Item'
import Form from './Form'
import useBlobs from './useBlobs'

export default function Blob() {
  const {
    listBlobs,
    createBlob,
    updateBlob,
    deleteBlob,
    errors,
    reload,
  } = useBlobs()

  if (errors.length > 0) {
    errors.forEach(e => { console.log(e) })
  }

  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <h3>Home</h3>
      <button type="button" onClick={reload}>
        Reload
      </button>
      <Form refetch={reload} submit={createBlob} />
      {errors.length > 0 && 'there were errors :('}
      <div className="blobList">
        {listBlobs.map(({ id, ...x }) => (
          <Item
            key={id}
            data={x}
            id={id}
            blobUpdate={updateBlob(id)}
            blobDelete={deleteBlob(id)}
          />
        ))}
      </div>
    </>
  )
}
