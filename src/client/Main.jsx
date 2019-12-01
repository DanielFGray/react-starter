import React, { useState } from 'react'
import gql from 'graphql-tag'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Helmet } from 'react-helmet-async'

const gqlMessageList = gql`
  query messageList {
    MessageList {
      message
      id
    }
  }
`

const gqlMessageAdd = gql`
  mutation messageAdd ($message: String!) {
    MessageAdd(message: $message) {
      message
      id
    }
  }
`

const gqlMessagePatch = gql`
  mutation messagePatch ($message: String! $id: Int!) {
    MessagePatch(message: $message id: $id) {
      message
      id
    }
  }
`

const gqlMessageDel = gql`
  mutation messageDel ($id: Int!) {
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

  const handleEscape = e => {
    if (e.keyCode === 27) {
      cancelEdit(e)
    }
  }

  return (
    <li className="message">
      <form onSubmit={doneEdit}>
        {editing ? (
          <>
            <input type="text" value={entryText} onKeyDown={handleEscape} onChange={e => entryChange(e.target.value)} />
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
  const { errors: errorQuery, loading, refetch, data } = useQuery(gqlMessageList)
  const [msgAdd, { errors: errorAdd }] = useMutation(gqlMessageAdd)
  const [msgPatch, { errors: errorPatch }] = useMutation(gqlMessagePatch)
  const [msgDel, { errors: errorDel }] = useMutation(gqlMessageDel)

  const errors = [errorQuery, errorPatch, errorAdd, errorDel].filter(Boolean)
  if (errors.length > 0) {
    errors.forEach(e => console.log(e))
    return 'there were errors :('
  }

  const reload = () => refetch()

  const submit = message => {
    msgAdd({
      variables: { message },
      update: (proxy, { data: { MessageAdd } }) => {
        const cache = proxy.readQuery({ query: gqlMessageList })
        // Write our data back to the cache with the new comment in it
        proxy.writeQuery({
          query: gqlMessageList,
          data: {
            MessageList: cache.MessageList.concat(MessageAdd),
          },
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
                  messagePatch: {
                    __typename: 'Message',
                    id,
                    message,
                  },
                },
                update: (proxy, { data: { MessagePatch } }) => {
                  const cache = proxy.readQuery({ query: gqlMessageList })
                  const idx = cache.MessageList.findIndex(e => e.id === id)
                  const MessageList = cache.MessageList.slice(0, idx)
                    .concat(MessagePatch, cache.MessageList.slice(idx + 1))
                  proxy.writeQuery({
                    query: gqlMessageList,
                    data: { MessageList },
                  })
                },
              })}
              msgDel={() => msgDel({
                variables: { id },
                update: proxy => {
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
