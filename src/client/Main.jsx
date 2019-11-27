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
  mutation ($message: String! $id: Int!) {
    MessagePatch(message: $message id: $id) {
      message
      id
    }
  }
`

const gqlMessageDel = gql`
  mutation ($id: Int!) {
    MessageDel(id: $id) {
      id
    }
  }
`

function Item({ id, message, msgPatch, msgDel }) {
  const [entryText, entryChange] = useState(message)
  const [editing, editingChange] = useState(false)

  const doneEdit = e => {
    e.preventDefault()
    msgPatch({ variables: { id, message: entryText } })
    editingChange(false)
  }

  return (
    <li className="message">
      <form onSubmit={doneEdit}>
        {editing ? (
          <>
            <input type="text" value={entryText} onChange={e => entryChange(e.target.value)} />
            <input type="submit" value="edit" onClick={doneEdit} />
            <button onClick={() => msgDel({ variables: { id } })}>
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
    <form onSubmit={e => {
      e.preventDefault()
      entryChange('')
      submit()
    }}>
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
function Main() {
  const { errors: errorQuery, loading, refetch, data } = useQuery(gqlMessageList)
  const [msgAdd, { loading: adding, errors: errorAdd }] = useMutation(gqlMessageAdd)
  const [msgPatch, { loading: patching, errors: errorPatch }] = useMutation(gqlMessagePatch)
  const [msgDel, { loading: deleting, errors: errorDel }] = useMutation(gqlMessageDel)

  const errors = [errorQuery, errorPatch, errorAdd, errorDel].filter(Boolean)
  if (errors.length) {
    errors.forEach(e => console.log(e))
    return 'there were errors :('
  }

  return (
    <>
      <Helmet>
        <title>Home</title>
      </Helmet>
      <div>
        <h3>Home</h3>
        <Form
          refetch={() => refetch()}
          submit={async e => {
            preventDefault()
            await msgAdd({ variales: { messae: entry } })
            refetch()
          }}
        />
        <ul className="messageList">
          {data && data.MessageList && data.MessageList.map(({ id, ...x }) => (
            <Item key={id} msgPatch={msgPatch} msgDel={msgDel} {...x} id={id} />
          ))}
        </ul>
      </div>
    </>
  )
}


export default Main
