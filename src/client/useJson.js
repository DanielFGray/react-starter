import { useReducer, useEffect } from 'react'

const reducer = (state = {}, action) => {
  switch (action.type) {
  case 'WAIT':
    return { ...state, loading: true }
  case 'DATA':
    return {
      ...state,
      loading: false,
      data: action.payload,
      error: null,
    }
  case 'ERROR':
    return { ...state, loading: false, error: action.error }
  default: throw new Error(`unknown action type: ${action.type}`)
  }
}

export default function useJson(url, { autoFetch = true, initData = null, ...props } = {}) {
  const [state, dispatch] = useReducer(reducer, {
    data: initData,
    error: null,
    loading: autoFetch,
  })

  async function refetch(u = url, { autoFetch: _, ...opts } = {}) {
    try {
      dispatch({ type: 'WAIT' })
      const x = await fetch(u, { ...props, ...opts })
      const { status, body } = await x.json()
      if (status === 'ok') {
        dispatch({ type: 'DATA', payload: body })
      } else {
        dispatch({ type: 'ERROR', error: body })
      }
    } catch (e) {
      dispatch({ type: 'ERROR', error: e.message })
    }
  }

  useEffect(() => {
    if (url && autoFetch) {
      refetch()
    }
  }, [])

  return [state, refetch]
}
