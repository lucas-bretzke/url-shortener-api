import express from 'express'
import { PrismaClient } from '@prisma/client'

/**
 * Resolvers.
 */
import userResolvers from './resolvers/user-resolvers'
import shortUrl from './resolvers/shortened-urls-resolvers'
import auth from './resolvers/auth-resolvers'

const prisma = new PrismaClient()

const app = express()
const port = Number(process.env.PORT || 8080)
const ipAddress = '0.0.0.0'

app.use(express.json())
app.use(express.raw({ type: 'application/vnd.custom-type' }))
app.use(express.text({ type: 'text/html' }))

// Rotas para funcionalidades de URLs encurtadas
app.use('/shortUrl', shortUrl)

// Rotas para funcionalidades relacionadas a usuários
app.use('/user', userResolvers)

// Rotas para funcionalidades de autenticação
app.use('/auth', auth)

app.get('/:code', async (req, res) => {
  const code = req.params.code
  const fullUrl = `url-shortener-api-1i7w.onrender.com/${code}`

  try {
    const link = await prisma.link.findFirst({
      where: { short_url: fullUrl }
    })

    if (!link) return res.status(404).send('URL not found')

    await prisma.link.update({
      where: { link_id: link.link_id },
      data: {
        access_count: {
          increment: 1
        }
      }
    })

    res.redirect(link.original_url)
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


async function checkDatabaseConnection() {
  try {
    await prisma.$connect()
    console.log('Conexão com o banco de dados estabelecida com sucesso!')
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error)
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Server start.
 */
app.listen(port, ipAddress, () => {
  console.log(`Server is running on http://localhost:${port}`)
  checkDatabaseConnection()
})
