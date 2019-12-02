import Koa from 'koa'
import bodyParser from 'koa-bodyparser'

import accessLog from './accessLog'
import errorLog from './errorLog'
import log from './log'
import router from './router'

const app = new Koa()

app.use(accessLog)
app.use(errorHandler)
app.use(bodyParser())

app.on('error', errorLog)

app.use(router.routes())
app.use(router.allowedMethods())

const port = process.env.PORT || 3001

app.listen(port, () => {
  log.info('Application started')
  log.info(`└── Listening on port: ${port}`)
})

async function errorHandler (ctx: Koa.Context, next: () => Promise<any>) {
  try {
    await next()
  } catch (error) {
    ctx.status = 500
    ctx.response.body = error.message
    ctx.app.emit('error', error, ctx)
  }
}
