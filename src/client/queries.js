import gql from 'graphql-tag'

export const BlobParts = gql`
  fragment BlobParts on Blob {
    blob
    id
    title
    created_at
    updated_at
  }
`

export const BlobListQuery = gql`
  query {
    BlobList {
      ...BlobParts
    }
  }
  ${BlobParts}
`

export const BlobCreateMutation = gql`
  mutation ($blob: String!, $title: String!) {
    BlobCreate(blob: $blob, title: $title) {
      ...BlobParts
    }
  }
  ${BlobParts}
`

export const BlobUpdateMutation = gql`
  mutation ($id: Int!, $blob: String!, $title: String!) {
    BlobUpdate(id: $id, blob: $blob, title: $title) {
      ...BlobParts
    }
  }
  ${BlobParts}
`

export const BlobDeleteMutation = gql`
  mutation ($id: Int!) {
    BlobDelete(id: $id)
  }
`

export const BlobCreatedSubscription = gql`
  subscription {
    BlobCreated {
      ...BlobParts
    }
  }
  ${BlobParts}
`

export const BlobUpdatedSubscription = gql`
  subscription {
    BlobUpdated {
      ...BlobParts
    }
  }
  ${BlobParts}
`

export const BlobDeletedSubscription = gql`
  subscription {
    BlobDeleted
  }
`
