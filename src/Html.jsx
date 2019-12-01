/* eslint react/no-danger: off */
import * as React from 'react'

const Html = ({
  data,
  html,
  helmet,
  appBase = '',
  styles,
  scripts,
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
          href={`${appBase}/${link}`}
        />
      ))}
    </head>
    <body {...helmet.bodyAttributes.toComponent()}>
      <div
        id={process.env.MOUNT}
        dangerouslySetInnerHTML={{
          __html: html,
        }}
      />
      {data && (
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: Object.entries(data)
              .reduce((p, [k, v]) => p.concat(`window[${JSON.stringify(k)}]=\`${
                JSON.stringify(v, null, process.env.NODE_ENV === 'development' ? 2 : undefined)
              }\`;`), ''),
          }}
        />
      )}
      {helmet.script.toComponent()}
      {scripts && scripts.map(js => (
        <script
          key={js}
          type="text/javascript"
          src={`${appBase}/${js}`}
        />
      ))}
    </body>
  </html>
)

export default Html
