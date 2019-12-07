import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Helmet } from 'react-helmet-async'

const gqlMessageList = gql`
  query {
    MessageList {
      message
      id
    }
  }
`

const gqlMessageAdd = gql`
  mutation ($message: String!) {
    MessageAdd(message: $message) {
      message
      id
    }
  }
`

const gqlMessagePatch = gql`
  mutation ($id: Int! $message: String!) {
    MessagePatch(id: $id message: $message) {
      message
      id
    }
  }
`

const gqlMessageDel = gql`
  mutation ($id: Int!) {
    MessageDel(id: $id)
  }
`

function Item({
  message,
  msgPatch,
  msgDel,
}) {
  const [entryText, entryChange] = useState(message)
  const [editing, editingChange] = useState(false)

  const doneEdit = e => {
    e.preventDefault()
    msgPatch(entryText)
    editingChange(false)
  }

  const cancelEdit = e => {
    e.preventDefault()
    entryChange(message)
    editingChange(false)
  }

  const handleDelete = () => {
    msgDel()
  }

  return (
    <li className="message">
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
            <label onClick={() => editingChange(true)}>{message}</label>
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
          placeholder="enter a message"
          value={entry}
          onChange={e => entryChange(e.target.value)}
        />
      </div>
    </form>
  )
}

export default function Main() {
  const { error: errorQuery, refetch, data } = useQuery(gqlMessageList)
  const [msgAdd, { error: errorAdd }] = useMutation(gqlMessageAdd)
  const [msgPatch, { error: errorPatch }] = useMutation(gqlMessagePatch)
  const [msgDel, { error: errorDel }] = useMutation(gqlMessageDel)

  const errors = [errorQuery, errorPatch, errorAdd, errorDel].filter(Boolean)
  if (errors.length > 0) {
    errors.forEach(e => console.log(e))
    return 'there were errors :('
  }

  const reload = () => refetch()

  const submit = message => {
    msgAdd({
      variables: { message },
      optimisticResponse: {
        __typename: 'Mutation',
        MessageAdd: {
          __typename: 'Message',
          id: null,
          message,
        },
      },
      update: (proxy, result) => {
        const cache = proxy.readQuery({ query: gqlMessageList })
        // Write our data back to the cache with the new comment in it
        const MessageList = cache.MessageList.concat(result.data.MessageAdd)
        proxy.writeQuery({
          query: gqlMessageList,
          data: { MessageList },
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
        <ul className="messageList">
          {data?.MessageList.map(({ id, ...x }) => (
            <Item
              key={id}
              msgPatch={message => msgPatch({
                variables: { id, message },
                optimisticResponse: {
                  __typename: 'Mutation',
                  MessagePatch: {
                    __typename: 'Message',
                    id,
                    message,
                  },
                },
                update: (proxy, result) => {
                  const cache = proxy.readQuery({ query: gqlMessageList })
                  const idx = cache.MessageList.findIndex(e => e.id === id)
                  const MessageList = cache.MessageList.slice(0, idx)
                    .concat(result.data.MessagePatch, cache.MessageList.slice(idx + 1))
                  proxy.writeQuery({
                    query: gqlMessageList,
                    data: { MessageList },
                  })
                },
              })}

              msgDel={() => msgDel({
                variables: { id },
                update: proxy => {
                  if (! data.MessageDel) return
                  const cache = proxy.readQuery({ query: gqlMessageList })
                  const idx = cache.MessageList.findIndex(e => e.id === id)
                  const MessageList = cache.MessageList.slice(0, idx)
                    .concat(cache.MessageList.slice(idx + 1))
                  proxy.writeQuery({
                    query: gqlMessageList,
                    data: { MessageList },
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
