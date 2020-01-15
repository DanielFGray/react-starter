import React, { useState } from 'react'

export default function Form({ submit }) {
  const [body, bodyChange] = useState('')
  const [title, titleChange] = useState('')

  const handleSubmit = e => {
    e.preventDefault()
    submit({ body, title })
    bodyChange('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          placeholder="title"
          value={title}
          onChange={e => titleChange(e.target.value)}
        />
        <div>
          <textarea
            placeholder="type something"
            value={body}
            onChange={e => bodyChange(e.target.value)}
          />
        </div>
        <button type="submit" onClick={handleSubmit}>
          Send
        </button>
      </div>
    </form>
  )
}
