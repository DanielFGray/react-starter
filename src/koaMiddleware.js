import send from 'koa-send'
import { format } from './utils'

export const logger = str => async (ctx, next) => {
  const start = Date.now()
  await next()
  const time = `${Date.now() - start}ms`
  console.log(format(str, { ...ctx, time }))
}

export const responseTime = async (ctx, next) => {
  await next()
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
