import Router from 'koa-router'
import * as fs from 'fs'
import * as path from 'path'
import removeAccent from 'remove-accents'

const router = new Router()

router.get('/dictionaries', async (ctx) => {
  const [en, fr] = await Promise.all([
    fs.promises.readFile(path.join(__dirname, 'dictionaries', 'english.txt'), 'utf-8'),
    fs.promises.readFile(path.join(__dirname, 'dictionaries', 'francais.txt'), 'utf-8')
  ])
  ctx.body = {
    EN: removeAccent(en).split(/\r?\n/),
    FR: removeAccent(fr).split(/\r?\n/)
  }
})

export default router
