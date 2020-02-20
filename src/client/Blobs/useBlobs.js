import { useEffect } from 'react'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import BlobListQuery from './queries/BlobListQuery.gql'
import BlobCreateMutation from './queries/BlobCreateMutation.gql'
import BlobUpdateMutation from './queries/BlobUpdateMutation.gql'
import BlobDeleteMutation from './queries/BlobDeleteMutation.gql'
import BlobCreatedSubscription from './queries/BlobCreatedSubscription.gql'
import BlobUpdatedSubscription from './queries/BlobUpdatedSubscription.gql'
import BlobDeletedSubscription from './queries/BlobDeletedSubscription.gql'

export default function useBlobs() {
  const {
    data,
    refetch,
    error: errorQuery,
    subscribeToMore,
  } = useQuery(BlobListQuery)
  const [CreateBlob, { error: errorCreate }] = useMutation(BlobCreateMutation)
  const [UpdateBlob, { error: errorUpdate }] = useMutation(BlobUpdateMutation)
  const [DeleteBlob, { error: errorDel }] = useMutation(BlobDeleteMutation)

  const { error: delSubErr } = useSubscription(BlobDeletedSubscription, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      const deleted = subscriptionData.data?.BlobDeleted
      if (! deleted) return
      const cache = client.readQuery({ query: BlobListQuery })
      const idx = cache.BlobList.findIndex(e => e.id === deleted)
      if (idx < 0) return
      const BlobList = [
        ...cache.BlobList.slice(0, idx),
        ...cache.BlobList.slice(idx + 1),
      ]
      client.writeQuery({
        query: BlobListQuery,
        data: { BlobList },
      })
    },
  })

  const { error: updSubErr } = useSubscription(BlobUpdatedSubscription, {
    onSubscriptionData: ({ client, subscriptionData }) => {
      const updated = subscriptionData.data?.BlobUpdated
      if (! updated) return
      const cache = client.readQuery({ query: BlobListQuery })
      const idx = cache.BlobList.findIndex(e => e.id === updated.id)
      if (idx < 0) return
      const BlobList = [
        ...cache.BlobList.slice(0, idx),
        subscriptionData.data.BlobUpdated,
        ...cache.BlobList.slice(idx + 1),
      ]
      client.writeQuery({
        query: BlobListQuery,
        data: { BlobList },
      })
    },
  })

  useEffect(() => {
    if (subscribeToMore) {
      subscribeToMore({
        document: BlobCreatedSubscription,
        updateQuery: (prev, { subscriptionData }) => {
          const newBlob = subscriptionData.data.BlobCreated
          const exists = prev.BlobList.find(({ id }) => id === newBlob.id)
          if (exists) return prev
          return {
            ...prev,
            BlobList: [newBlob, ...prev.BlobList],
          }
        },
      })
    }
  }, [subscribeToMore])

  const errors = [
    errorQuery,
    errorUpdate,
    errorCreate,
    errorDel,
    delSubErr,
    updSubErr,
  ].filter(Boolean)

  const reload = () => refetch()

  const listBlobs = data?.BlobList
    .slice(0)
    .sort((a, b) => b.updated_at - a.updated_at) ?? []

  const updateBlob = id => ({ body, title }) => UpdateBlob({
    variables: { id, body, title },
    optimisticResponse: {
      __typename: 'Mutation',
      BlobUpdate: {
        __typename: 'Blob',
        id,
        body,
        title,
      },
    },
    update: (proxy, result) => {
      const cache = proxy.readQuery({ query: BlobListQuery })
      const idx = cache.BlobList.findIndex(e => e.id === id)
      if (idx < 0) return
      const BlobList = [
        ...cache.BlobList.slice(0, idx),
        result.data.BlobUpdate,
        ...cache.BlobList.slice(idx + 1),
      ]
      proxy.writeQuery({
        query: BlobListQuery,
        data: { BlobList },
      })
    },
  })

  const deleteBlob = id => () => DeleteBlob({
    variables: { id },
    update: proxy => {
      const cache = proxy.readQuery({ query: BlobListQuery })
      const idx = cache.BlobList.findIndex(e => e.id === id)
      if (idx < 0) return
      const BlobList = [
        ...cache.BlobList.slice(0, idx),
        ...cache.BlobList.slice(idx + 1),
      ]
      proxy.writeQuery({
        query: BlobListQuery,
        data: { BlobList },
      })
    },
  })

  const createBlob = ({ body, title }) => CreateBlob({
    variables: { body, title },
    optimisticResponse: {
      __typename: 'Mutation',
      BlobCreate: {
        __typename: 'Blob',
        id: null,
        body,
        title,
      },
    },
    update: (proxy, result) => {
      const created = result.data.BlobCreate
      const cache = proxy.readQuery({ query: BlobListQuery })
      const exists = cache.BlobList.findIndex(e => e.id === created.id)
      if (exists > -1) return
      const BlobList = [created, ...cache.BlobList]
      proxy.writeQuery({
        query: BlobListQuery,
        data: { BlobList },
      })
    },
  })

  return {
    listBlobs,
    createBlob,
    updateBlob,
    deleteBlob,
    errors,
    reload,
  }
}
