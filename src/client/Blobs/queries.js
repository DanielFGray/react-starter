import gql from 'graphql-tag'

export const BlobParts = gql`
  fragment BlobParts on Blob {
    body
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
  mutation ($body: String!, $title: String!) {
    BlobCreate(body: $body, title: $title) {
      ...BlobParts
    }
  }
  ${BlobParts}
`

export const BlobUpdateMutation = gql`
  mutation ($id: Int!, $body: String!, $title: String!) {
    BlobUpdate(id: $id, body: $body, title: $title) {
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
