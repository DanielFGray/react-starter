import React, { useState, useEffect } from 'react'

export default function useAPI(props) {
  const [state, _setState] = useState({
    data: props.initData,
    error: null,
    loading: true,
  })

  const setState = patch => state => _setState({ ...state, ...patch })

  const refetch = async () => {
    try {
      setState({ loading: true })
      const x = await fetch(`/api/v1${props.url || ''}`)
      const { status, body } = await x.json()
      if (status === 'ok') {
        setState({ data: body, loading: false, error: null })
      } else {
        throw new Error(body)
      }
    } catch (e) {
      setState({ error: e.message, loading: false })
    }
  }

  useEffect(() => {
    refetch()
  }, [])

  return [state, refetch]
}
