import express from 'express'
import { PrismaClient } from '@prisma/client'

/**
 * Resolvers.
 */
import userResolvers from './resolvers/user-resolvers'
import shortUrl from './resolvers/shortened-urls-resolver'
import auth from './resolvers/auth-resolver'

const prisma = new PrismaClient()

const app = express()
const port = Number(process.env.PORT || 3000)

app.use(express.json())
app.use(express.raw({ type: 'application/vnd.custom-type' }))
app.use(express.text({ type: 'text/html' }))


app.use('/shortUrl', shortUrl)

app.use('/user', userResolvers)

app.use('/auth', auth)

app.get('/:code', async (req, res) => {
  const code = req.params.code

  try {
    const link = await prisma.link.findUnique({
      where: { link_id: parseInt(code) }
    })

    if (!link) {
      res.status(404).send('URL not found')
    } else {
      res.redirect(link.original_url)
    }
  } catch (error) {
    console.log('get error', error)
    res.status(500).send('Internal Server Error')
  }
})

app.get('/', async (req, res) => {
  try {
    res.send(`<h3>API Rodando!</h3>`.trim())
  } catch (error) {
    res.status(500).send(`<h3>Erro interno do servidor</h3>`.trim())
  }
})

/**
 * Server start.
 */
app.listen(port, '192.168.0.14', () => {
  console.log(`Server is running on http://192.168.0.14:${port}`)
})
