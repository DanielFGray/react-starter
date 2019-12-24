import { useReducer, useEffect, useCallback } from 'react'
import 'isomorphic-unfetch'

const reducer = (state, action) => {
  switch (action.type) {
  case 'WAIT':
    return { ...state, loading: true }
  case 'DATA':
    return {
      ...state,
      loading: false,
      response: action.payload,
      error: null,
    }
  case 'ERROR':
    return { ...state, loading: false, error: action.error }
  default: throw new Error(`unknown action type: ${action.type}`)
  }
}

export default function useFetch(url, {
  autoFetch = true,
  ...props
} = {}) {
  const [state, dispatch] = useReducer(reducer, {
    response: null,
    error: null,
    loading: autoFetch,
  })

  const refetch = useCallback(async (u = url, { ...opts }) => {
    try {
      dispatch({ type: 'WAIT' })
      const res = await fetch(u, { ...props, ...opts })
      let body = await res.text()
      try { body = JSON.parse(body) } catch (e) { /* fallthrough */ }
      dispatch({
        type: 'DATA',
        payload: {
          body,
          headers: Object.fromEntries([...res.headers.entries()]),
          status: res.status,
          statusText: res.statusText,
        },
      })
    } catch (e) {
      dispatch({ type: 'ERROR', error: e.message })
    }
  }, [url, props])

  useEffect(() => {
    if (url && autoFetch) {
      refetch()
    }
  }, [])

  return [state, refetch]
}

export function useGraphql(url, {
  query,
  variables = {},
  headers = {},
  autoFetch = true,
  ...props
}) {
  return useFetch(url, {
    autoFetch,
    method: 'post',
    ...props,
    headers: {
      'Content-Type': 'application/json',
      // Accept: 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  })
}
