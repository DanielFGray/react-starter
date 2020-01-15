import React, { useState } from 'react'

export default function Item({
  blobUpdate,
  blobDelete,
  data: {
    body,
    title,
    // id,
    // created_at,
    // updated_at,
  },
}) {
  const [bodyText, bodyChange] = useState(body)
  const [titleText, titleChange] = useState(title)
  const [editing, editingChange] = useState(false)

  const doneEdit = e => {
    e.preventDefault()
    if (bodyText === '') {
      blobDelete()
      return
    }
    blobUpdate({ body: bodyText, title: titleText })
    editingChange(false)
  }

  const cancelEdit = e => {
    e.preventDefault()
    bodyChange(body)
    editingChange(false)
  }

  const handleDelete = () => {
    blobDelete()
  }
  if (editing) {
    return (
      <div className="body">
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
            value={bodyText}
            onChange={e => bodyChange(e.target.value)}
            onKeyDown={e => {
              if (e.keyCode === 27) {
                cancelEdit(e)
              }
            }}
          />
        </div>
        <button type="submit" onClick={doneEdit}>Update</button>
        <button type="button" onClick={handleDelete}>Delete</button>
      </div>
    )
  }

  return (
    <div className="body">
      <label htmlFor="edit" onClick={() => editingChange(true)}>
        {title && (
          <span style={{ fontWeight: 'bold' }}>
            {`${title}: `}
          </span>
        )}
        {body}
      </label>
      <button
        type="button"
        name="edit"
        className="edit"
        onClick={() => editingChange(true)}
      >
        edit
      </button>
    </div>
  )
}
