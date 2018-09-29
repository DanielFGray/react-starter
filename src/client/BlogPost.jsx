import * as React from 'react'
import Helmet from 'react-helmet-async'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

const BlogPost = ({
  title,
  date,
  category,
  tags,
  content,
}) => (
  <section>
    <Helmet>
      <title>{title}</title>
    </Helmet>
    <h1>{title}</h1>
    <div>
      <div className="date">{date}</div>
      <div className="category">{category}</div>
      <div className="tags">
        {tags.map(t => (
          <span key={t} className="tag">{t}</span>
        ))}
      </div>
    </div>
    <article>{content}</article>
  </section>
)

const query = gql`
  query blogPostByName($id: String) {
    Post(id: $id) {
      title
      date
      category
      tags
      content
    }
  }`

export default ({ match: { params } }) => (
  <Query query={query} variables={{ id: params.filename }}>
    {({ loading, error, data }) => {
      if (error) return `Error! ${error.message}`
      if (loading) return 'Loading...'
      return (<BlogPost {...data} />)
    }}
  </Query>
)
