import * as React from 'react'
import gql from 'graphql-tag'
import { Mutation, Query } from 'react-apollo'
import Helmet from 'react-helmet-async'

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
      message
      id
    }
  }
`

class Item extends React.Component {
  state = {
    editText: this.props.message,
    editing: false,
  }

  textChange = e => {
    this.setState({ editText: e.target.value })
  }

  toggleEdit = () => {
    this.setState(s => ({ editing: ! s.editing }))
  }

  handleSubmit = f => e => {
    e.preventDefault()
    f()
  }

  render() {
    const { id, message } = this.props
    const { editText, editing } = this.state
    return (
      <Mutation
        mutation={gqlMessagePatch}
        variables={{ id, message: editText }}
      >
        {(patch, { errors }) => {
          if (errors) errors.forEach(e => console.error(e))
          return (
            <form onSubmit={this.handleSubmit(patch)}>
              <div key={id}>
                {editing
                  ? <input type="text" value={editText} onChange={this.textChange} />
                  : message}
                {' '}
                <Mutation
                  mutation={gqlMessageDel}
                  variables={{ id }}
                >
                  {(del, { errors }) => { // eslint-disable-line no-shadow
                    if (errors) errors.forEach(e => console.error(e))
                    return (
                      <button onClick={del}>Delete</button>
                    )
                  }}
                </Mutation>
                {' '}
                <button onClick={this.toggleEdit}>Edit</button>
              </div>
            </form>
          )
        }}
      </Mutation>
    )
  }
}

// https://www.apollographql.com/docs/react/essentials/mutations.html#update

class Main extends React.Component {
  state = {
    newItem: '',
  }

  textChange = e => {
    this.setState({ newItem: e.target.value })
  }

  handleSubmit = f => e => {
    e.preventDefault()
    f()
  }

  render() {
    const { newItem } = this.state
    return (
      <div>
        <Helmet>
          <title>Home</title>
        </Helmet>
        <h3>Home</h3>
        <Mutation mutation={gqlMessageAdd} variables={{ message: newItem }}>
          {add => (
            <Query query={gqlMessageList}>
              {({
                errors,
                loading,
                refetch,
                data,
              }) => {
                if (errors) errors.forEach(e => console.error(e))
                return (
                  <div>
                    <form onSubmit={this.handleSubmit(add)}>
                      <div>
                        <input type="text" value={newItem} onChange={this.textChange} />
                        {' '}
                        <button type="button" onClick={refetch}>
                          Reload
                        </button>
                      </div>
                      {loading && <div>loading...</div>}
                      {data.MessageList.map(({ id, ...x }) => (
                        <Item {...{ key: id, id, ...x }} />
                      ))}
                    </form>
                  </div>
                )
              }}
            </Query>
          )}
        </Mutation>
      </div>
    )
  }
}

export default Main
