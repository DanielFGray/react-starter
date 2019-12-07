import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Helmet } from 'react-helmet-async'

const gqlBlobList = gql`
  query {
    BlobList {
      blob
      id
    }
  }
`

const gqlBlobAdd = gql`
  mutation ($blob: String!) {
    BlobAdd(blob: $blob) {
      blob
      id
    }
  }
`

const gqlBlobPatch = gql`
  mutation ($id: Int! $blob: String!) {
    BlobPatch(id: $id blob: $blob) {
      blob
      id
    }
  }
`

const gqlBlobDel = gql`
  mutation ($id: Int!) {
    BlobDel(id: $id)
  }
`

function Item({
  blob,
  blobPatch,
  blobDel,
}) {
  const [entryText, entryChange] = useState(blob)
  const [editing, editingChange] = useState(false)

  const doneEdit = e => {
    e.preventDefault()
    blobPatch(entryText)
    editingChange(false)
  }

  const cancelEdit = e => {
    e.preventDefault()
    entryChange(blob)
    editingChange(false)
  }

  const handleDelete = () => {
    blobDel()
  }

  return (
    <li className="blob">
      <form onSubmit={doneEdit}>
        {editing ? (
          <>
            <input
              type="text"
              value={entryText}
              onChange={e => entryChange(e.target.value)}
              onKeyDown={e => {
                if (e.keyCode === 27) {
                  cancelEdit(e)
                }
              }}
            />
            <input type="submit" value="update" onClick={doneEdit} />
            <button onClick={handleDelete}>
              Delete
            </button>
          </>
        ) : (
          <>
            <label onClick={() => editingChange(true)}>{blob}</label>
            <button className="edit" onClick={() => editingChange(true)}>edit</button>
          </>
        )}
      </form>
    </li>
  )
}

// https://www.apollographql.com/docs/react/essentials/mutations.html#update

function Form({ submit, refetch }) {
  const [entry, entryChange] = useState('')

  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        submit(entry)
        entryChange('')
      }}
    >
      <div>
        <button type="button" onClick={refetch}>
          Reload
        </button>
      </div>
      <div>
        <input
          type="text"
          placeholder="enter a blob"
          value={entry}
          onChange={e => entryChange(e.target.value)}
        />
      </div>
    </form>
  )
}

export default function Main() {
  const { error: errorQuery, refetch, data } = useQuery(gqlBlobList)
  const [blobAdd, { error: errorAdd }] = useMutation(gqlBlobAdd)
  const [blobPatch, { error: errorPatch }] = useMutation(gqlBlobPatch)
  const [blobDel, { error: errorDel }] = useMutation(gqlBlobDel)

  const errors = [errorQuery, errorPatch, errorAdd, errorDel].filter(Boolean)
  if (errors.length > 0) {
    errors.forEach(e => console.log(e))
    return 'there were errors :('
  }

  const reload = () => refetch()

  const submit = blob => {
    blobAdd({
      variables: { blob },
      optimisticResponse: {
        __typename: 'Mutation',
        BlobAdd: {
          __typename: 'Blob',
          id: null,
          blob,
        },
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

  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <div>
        <h3>Home</h3>
        <Form
          refetch={reload}
          submit={submit}
        />
        <ul className="blobList">
          {data?.BlobList.map(({ id, ...x }) => (
            <Item
              key={id}
              blobPatch={blob => blobPatch({
                variables: { id, blob },
                optimisticResponse: {
                  __typename: 'Mutation',
                  BlobPatch: {
                    __typename: 'Blob',
                    id,
                    blob,
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
                  if (! data.BlobDel) return
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
        </ul>
      </div>
    </>
  )
}
