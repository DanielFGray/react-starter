/* eslint react/no-danger: off */
import * as React from 'react'
import { endsWith } from 'ramda'
import { partition } from './utils'

const manifest = __non_webpack_require__('./manifest.json')

const [styles, scripts] = partition([
  endsWith('.css'),
  endsWith('.js'),
], Object.values(manifest))

const Html = ({
  data,
  html,
  helmet,
}) => (
  <html lang="en" {...helmet.htmlAttributes.toString()}>
    <head>
      {helmet.title.toComponent()}
      <meta charSet="utf-8" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {helmet.meta.toComponent()}
      {helmet.style.toComponent()}
      {helmet.link.toComponent()}
      {helmet.noscript.toComponent()}
      <meta charSet="utf-8" />
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"
      />
      {helmet.link.toComponent()}
      {styles && styles.map(link => (
        <link
          key={link}
          rel="stylesheet"
          type="text/css"
          href={`${__appBase}/${link}`}
        />
      ))}
    </head>
    <body {...helmet.bodyAttributes.toComponent()}>
      <div
        id={__mount}
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
      {data && (
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `window.__INIT_DATA = ${JSON.stringify(data)}`,
          }}
        />
      )}
      {helmet.script.toComponent()}
      {scripts && scripts.map(js => (
        <script
          key={js}
          type="text/javascript"
          src={`${__appBase}/${js}`}
        />
      ))}
    </body>
  </html>
)

export default Html
