import React, { useState, useEffect } from 'react'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Helmet } from 'react-helmet-async'

const BlobParts = gql`
  fragment BlobParts on Blob {
    blob
    id
    title
    created_at
    updated_at
  }
`

const gqlBlobList = gql`
  query {
    BlobList {
      ...BlobParts
    }
  }
  ${BlobParts}
`

const gqlBlobAdd = gql`
  mutation ($blob: String!, $title: String!) {
    BlobAdd(blob: $blob, title: $title) {
      ...BlobParts
    }
  }
  ${BlobParts}
`

const gqlBlobPatch = gql`
  mutation ($id: Int!, $blob: String!, $title: String!) {
    BlobPatch(id: $id, blob: $blob, title: $title) {
      ...BlobParts
    }
  }
  ${BlobParts}
`

const gqlBlobDel = gql`
  mutation ($id: Int!) {
    BlobDel(id: $id)
  }
`

const gqlBlobSubscription = gql`
  subscription {
    BlobAdded {
      ...BlobParts
    }
  }
  ${BlobParts}
`

function Item({
  blobPatch,
  blobDel,
  id,
  blob,
  title,
  created_at,
  updated_at,
}) {
  const [blobText, blobChange] = useState(blob)
  const [titleText, titleChange] = useState(title)
  const [editing, editingChange] = useState(false)

  const doneEdit = e => {
    e.preventDefault()
    if (blobText === '') {
      return blobDel()
    }
    blobPatch({ blob: blobText, title: titleText })
    editingChange(false)
  }

  const cancelEdit = e => {
    e.preventDefault()
    blobChange(blob)
    editingChange(false)
  }

  const handleDelete = () => {
    blobDel()
  }

  return (
    <div className="blob">
      <form onSubmit={doneEdit} style={{ display: 'inline' }}>
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
            <input type="submit" value="update" onClick={doneEdit} />
            <button onClick={handleDelete}>
              Delete
            </button>
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
      </form>
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
    <form
      onSubmit={handleSubmit}
    >
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

export default function Main() {
  const { data, refetch, error: errorQuery, subscribeToMore } = useQuery(gqlBlobList)
  const [blobAdd, { error: errorAdd }] = useMutation(gqlBlobAdd)
  const [blobPatch, { error: errorPatch }] = useMutation(gqlBlobPatch)
  const [blobDel, { error: errorDel }] = useMutation(gqlBlobDel)

  useEffect(() => {
    if (subscribeToMore) {
      subscribeToMore({
        document: gqlBlobSubscription,
        updateQuery: (prev, { subscriptionData }) => {
          const newBlob = subscriptionData.data.BlobAdded
          const exists = newBlob
            .some(b => prev.BlobList.find(({ id }) => id === b.id))
          if (exists) return prev
          return {
            ...prev,
            BlobList: [].concat(newBlob, prev.BlobList)
          }
        },
      })
    }
  }, [subscribeToMore])

  const errors = [errorQuery, errorPatch, errorAdd, errorDel].filter(Boolean)
  if (errors.length > 0) {
    errors.forEach(e => { console.log(e) })
    return 'there were errors :('
  }

  const reload = () => refetch()

  const submit = ({ blob, title }) => {
    blobAdd({
      variables: { blob, title },
      optimisticResponse: {
        __typename: 'Mutation',
        BlobAdd: [
          {
            __typename: 'Blob',
            id: null,
            blob,
            title,
          },
        ],
      },
      update: (proxy, result) => {
        const cache = proxy.readQuery({ query: gqlBlobList })
        // Write our data back to the cache with the new comment in it
        const BlobList = cache.BlobList.concat(result.data.BlobAdd)
        proxy.writeQuery({
          query: gqlBlobList,
          data: { BlobList },
        })
      },
    })
  }

  const blobList = data?.BlobList
    .slice(0)
    .sort((a, b) => b.updated_at - a.updated_at) ?? []

  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <h3>Home</h3>
      <button type="button" onClick={reload}>
        Reload
      </button>
      <Form
        refetch={reload}
        submit={submit}
      />
      <div className="blobList">
        {blobList.map(({ id, ...x }) => (
          <Item
            key={id}
            blobPatch={({ blob, title }) => blobPatch({
              variables: { id, blob, title },
              optimisticResponse: {
                __typename: 'Mutation',
                BlobPatch: {
                  __typename: 'Blob',
                  id,
                  blob,
                  title,
                },
              },
              update: (proxy, result) => {
                const cache = proxy.readQuery({ query: gqlBlobList })
                const idx = cache.BlobList.findIndex(e => e.id === id)
                const BlobList = cache.BlobList.slice(0, idx)
                  .concat(result.data.BlobPatch, cache.BlobList.slice(idx + 1))
                proxy.writeQuery({
                  query: gqlBlobList,
                  data: { BlobList },
                })
              },
            })}

            blobDel={() => blobDel({
              variables: { id },
              update: proxy => {
                const cache = proxy.readQuery({ query: gqlBlobList })
                const idx = cache.BlobList.findIndex(e => e.id === id)
                const BlobList = cache.BlobList.slice(0, idx)
                  .concat(cache.BlobList.slice(idx + 1))
                proxy.writeQuery({
                  query: gqlBlobList,
                  data: { BlobList },
                })
              },
            })}
            {...x}
            id={id}
          />
        ))}
      </div>
    </>
  )
}
