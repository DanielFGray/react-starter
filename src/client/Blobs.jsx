import React, { useState, useEffect } from 'react'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import { Helmet } from 'react-helmet-async'
import * as gql from './queries'

function Item({
  blobUpdate,
  blobDelete,
  data: {
    blob,
    title,
    // id,
    // created_at,
    // updated_at,
  },
}) {
  const [blobText, blobChange] = useState(blob)
  const [titleText, titleChange] = useState(title)
  const [editing, editingChange] = useState(false)

  const doneEdit = e => {
    e.preventDefault()
    if (blobText === '') {
      blobDelete()
      return
    }
    blobUpdate({ blob: blobText, title: titleText })
    editingChange(false)
  }

  const cancelEdit = e => {
    e.preventDefault()
    blobChange(blob)
    editingChange(false)
  }

  const handleDelete = () => {
    blobDelete()
  }

  return (
    <div className="blob">
      {editing ? (
        <>
          <input
            type="text"
            value={titleText}
            onChange={e => titleChange(e.target.value)}
            onKeyDown={e => {
              if (e.keyCode === 27) {
                cancelEdit(e)
              }
            }}
          />
          <div>
            <textarea
              value={blobText}
              onChange={e => blobChange(e.target.value)}
              onKeyDown={e => {
                if (e.keyCode === 27) {
                  cancelEdit(e)
                }
              }}
            />
          </div>
          <button onClick={doneEdit}>Update</button>
          <button onClick={handleDelete}>Delete</button>
        </>
      ) : (
        <>
          <label htmlFor="edit" onClick={() => editingChange(true)}>
            {title && (
              <span style={{ fontWeight: 'bold' }}>
                {`${title}: `}
              </span>
            )}
            {blob}
          </label>
          <button name="edit" className="edit" onClick={() => editingChange(true)}>edit</button>
        </>
      )}
    </div>
  )
}

function Form({ submit }) {
  const [blobText, blobChange] = useState('')
  const [titleText, titleChange] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    submit({ blob: blobText, title: titleText })
    blobChange('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="title"
          value={titleText}
          onChange={e => titleChange(e.target.value)}
        />
        <div>
          <textarea
            placeholder="type something"
            value={blobText}
            onChange={e => blobChange(e.target.value)}
          />
        </div>
        <button type="submit" onClick={handleSubmit}>
          Send
        </button>
      </div>
    </form>
  )
}

export default function Blob() {
  const {
    data,
    refetch,
    error: errorQuery,
    subscribeToMore,
  } = useQuery(gql.BlobListQuery)
  const [blobCreate, { error: errorCreate }] = useMutation(gql.BlobCreateMutation)
  const [blobUpdate, { error: errorUpdate }] = useMutation(gql.BlobUpdateMutation)
  const [blobDelete, { error: errorDel }] = useMutation(gql.BlobDeleteMutation)

  const { error: delSubErr } = useSubscription(gql.BlobDeletedSubscription, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      const deleted = subscriptionData.data?.BlobDeleted
      if (! deleted) return
      const cache = client.readQuery({ query: gql.BlobListQuery })
      const idx = cache.BlobList.findIndex(e => e.id === deleted)
      if (idx < 0) return
      const BlobList = [
        ...cache.BlobList.slice(0, idx),
        ...cache.BlobList.slice(idx + 1),
      ]
      client.writeQuery({
        query: gql.BlobListQuery,
        data: { BlobList },
      })
    },
  })

  const { error: updSubErr } = useSubscription(gql.BlobUpdatedSubscription, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      const updated = subscriptionData.data?.BlobUpdated
      if (! updated) return
      const cache = client.readQuery({ query: gql.BlobListQuery })
      const idx = cache.BlobList.findIndex(e => e.id === updated.id)
      if (idx < 0) return
      const BlobList = [
        ...cache.BlobList.slice(0, idx),
        subscriptionData.data.BlobUpdated,
        ...cache.BlobList.slice(idx + 1),
      ]
      client.writeQuery({
        query: gql.BlobListQuery,
        data: { BlobList },
      })
    },
  })

  useEffect(() => {
    if (subscribeToMore) {
      subscribeToMore({
        document: gql.BlobCreatedSubscription,
        updateQuery: (prev, { subscriptionData }) => {
          const newBlob = subscriptionData.data.BlobCreated
          const exists = prev.BlobList.find(({ id }) => id === newBlob.id)
          if (exists) return prev
          return {
            ...prev,
            BlobList: [newBlob, ...prev.BlobList],
          }
        },
      })
    }
  }, [subscribeToMore])

  const errors = [
    errorQuery,
    errorUpdate,
    errorCreate,
    errorDel,
    delSubErr,
    updSubErr,
  ].filter(Boolean)
  if (errors.length > 0) {
    errors.forEach(e => { console.log(e) })
  }

  const reload = () => refetch()

  const submit = ({ blob, title }) => {
    blobCreate({
      variables: { blob, title },
      optimisticResponse: {
        __typename: 'Mutation',
        BlobCreate: [
          {
            __typename: 'Blob',
            id: null,
            blob,
            title,
          },
        ],
      },
      update: (proxy, result) => {
        const cache = proxy.readQuery({ query: gql.BlobListQuery })
        const BlobList = [result.data.BlobCreate, ...cache.BlobList]
        proxy.writeQuery({
          query: gql.BlobListQuery,
          data: { BlobList },
        })
      },
    })
  }

  const blobList = data?.BlobList
    .slice(0)
    .sort((a, b) => b.updated_at - a.updated_at) ?? []

  const updateBlob = id => ({ blob, title }) => blobUpdate({
    variables: { id, blob, title },
    optimisticResponse: {
      __typename: 'Mutation',
      BlobUpdate: {
        __typename: 'Blob',
        id,
        blob,
        title,
      },
    },
    update: (proxy, result) => {
      const cache = proxy.readQuery({ query: gql.BlobListQuery })
      const idx = cache.BlobList.findIndex(e => e.id === id)
      if (idx < 0) return
      const BlobList = [
        ...cache.BlobList.slice(0, idx),
        result.data.BlobUpdate,
        ...cache.BlobList.slice(idx + 1),
      ]
      proxy.writeQuery({
        query: gql.BlobListQuery,
        data: { BlobList },
      })
    },
  })

  const deleteBlob = id => () => blobDelete({
    variables: { id },
    update: proxy => {
      const cache = proxy.readQuery({ query: gql.BlobListQuery })
      const idx = cache.BlobList.findIndex(e => e.id === id)
      if (idx < 0) return
      const BlobList = [
        ...cache.BlobList.slice(0, idx),
        ...cache.BlobList.slice(idx + 1),
      ]
      proxy.writeQuery({
        query: gql.BlobListQuery,
        data: { BlobList },
      })
    },
  })

  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <h3>Home</h3>
      <button type="button" onClick={reload}>
        Reload
      </button>
      <Form refetch={reload} submit={submit} />
      {errors.length > 0 && 'there were errors :('}
      <div className="blobList">
        {blobList.map(({ id, ...x }) => (
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
