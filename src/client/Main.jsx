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
      id
    }
  }
`

class Item extends React.Component {
  state = {
    editText: this.props.message,
    editing: false,
  }

  inputChange = k => e => {
    this.setState({ [k]: e.target.value })
  }

  toggleState = k => () => {
    this.setState(s => ({ [k]: ! s[k] }))
  }

  handleSubmit = e => {
    e.preventDefault()
    this.setState({ editing: false })
    this.props.msgPatch({ variables: { id: this.props.id, message: this.state.editText } })
  }

  del = _ => {
    this.props.msgDel({ variables: { id: this.props.id } })
  }

  render() {
    const { id, message } = this.props
    const { editText, editing } = this.state
    return (
      <form onSubmit={this.handleSubmit}>
        <span>{id}</span>
        {' - '}
        {editing
          ? (
            <>
              <input type="text" value={editText} onChange={this.inputChange('editText')} />
              <input type="submit" value="edit" onClick={this.handleSubmit} />
              <button onClick={this.del}>Delete</button>
            </>
          ) : (
            <>
              <label onClick={this.toggleState('editing')}>{message}</label>
              <button onClick={this.toggleState('editing')}>edit</button>
            </>
          )
        }
      </form>
    )
  }
}

const List = ({ msgAdd, newItem, textChange, refetch, data, ...props }) => (
  <div>
    <h3>Home</h3>
    <form onSubmit={msgAdd}>
      <input type="text" placeholder="enter a message" value={newItem} onChange={textChange} />
      <button type="button" onClick={_ => refetch()}>
        Reload
      </button>
    </form>
    <ul>
      {data.MessageList && data.MessageList.map(({ id, ...x }) => (
        <li key={id}>
          <Item {...props} {...x} id={id} />
        </li>
      ))}
    </ul>
  </div>
)

// https://www.apollographql.com/docs/react/essentials/mutations.html#update

class Main extends React.Component {
  state = {
    newItem: '',
  }

  inputChange = k => e => {
    this.setState({ [k]: e.target.value })
  }

  handleSubmit = ({ msgAdd, refetch }) => e => {
    e.preventDefault()
    this.setState({ newItem: '' })
    msgAdd({ variables: { message: this.state.newItem } })
      .then(refetch)
  }

  render() {
    return (
      <>
        <Helmet>
          <title>Home</title>
        </Helmet>
        <Query query={gqlMessageList}>
          {({ errors: errorQuery, loading, refetch, data }) => (
            <Mutation mutation={gqlMessageAdd}>
              {(msgAdd, { errors: errorAdd }) => (
                <Mutation mutation={gqlMessagePatch}>
                  {(msgPatch, { errors: errorPatch }) => (
                    <Mutation
                      mutation={gqlMessageDel}
                      update={(cache, { data: { addTodo } }) => {
                        // const { todos } = cache.readQuery({ query: GET_TODOS });
                        // cache.writeQuery({
                        //   query: GET_TODOS,
                        //   data: { todos: todos.concat([addTodo]) }
                        // });
                      }}
                    >
                      {(msgDel, { errors: errorDel }) => {
                        const errors = [errorQuery, errorPatch, errorAdd, errorDel].filter(Boolean)
                        if (errors) errors.forEach(e => console.log(e))
                        return List({
                          msgAdd: this.handleSubmit({ msgAdd, refetch }),
                          msgPatch,
                          msgDel,
                          data,
                          refetch,
                          newItem: this.state.newItem,
                          textChange: this.inputChange('newItem'),
                        })
                      }}
                    </Mutation>
                  )}
                </Mutation>
              )}
            </Mutation>
          )}
        </Query>
      </>
    )
  }
}

export default Main
