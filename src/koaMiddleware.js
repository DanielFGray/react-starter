import send from 'koa-send'

export const logger = () => async (ctx, next) => {
  const start = Date.now()
  await next()
  const time = `${Date.now() - start}ms`
  console.log(`${ctx.method} ${ctx.url} ${ctx.status} - ${time}`)
}

export const staticFiles = opts => async (ctx, next) => {
  try {
    if (ctx.path !== '/') {
      return await send(ctx, ctx.path, opts)
    }
  } catch (e) {
    /* fallthrough */
  }
  return next()
}
