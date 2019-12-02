import Router from 'koa-router'

const router = new Router()

router.get('/toto', (ctx) => {
  ctx.body = 'Hello world'
})

export default router
