import { PrismaClient } from '@prisma/client'
import express from 'express'
import redis from './lib/cache'
import { z } from 'zod'

const prisma = new PrismaClient()

const app = express()
const port = Number(process.env.PORT || 3000)

type CreateUserInput = {
  username: string
  password: string
  email: string
}

interface User {
  user_id: number
  username: string
  password: string
  email: string
  created_at: Date
  links: Link[]
}
interface Link {
  link_id: number
  original_url: string
  short_url: string
  user_id?: number
  created_at: Date
  user?: User | null
}

app.use(express.json())
app.use(express.raw({ type: 'application/vnd.custom-type' }))
app.use(express.text({ type: 'text/html' }))

const cacheKey = 'artists:al'

app.get('/artists', async (req, res) => {
  try {
    const cachedArtists = await redis.get(cacheKey)

    if (cachedArtists) {
      return res.json(JSON.parse(cachedArtists))
    }

    const artists = await prisma.artist.findMany()
    await redis.set(cacheKey, JSON.stringify(artists))

    return res.json(artists)
  } catch (error) {
    return res.json({ error: error })
  }
})

app.post('/artist', async (req, res) => {
  const { name } = req.body

  try {
    const todo = await prisma.artist.create({
      data: {
        name
      }
    })

    redis.del(cacheKey)

    return res.json(todo)
  } catch (error) {
    return res.json({ error: error })
  }
})

app.get('/:code', async (req, res) => {
  const code = req.params.code as string

  try {
    // Consulte o link com base na chave primária link_id
    const link = await prisma.link.findUnique({
      where: { link_id: parseInt(code) }
    })

    if (!link) {
      res.status(404).send('Link not found')
    } else {
      res.redirect(link.original_url)
    }
  } catch (error) {
    console.log('get error', error)
    res.status(500).send('Internal Server Error')
  }
})

// Rota para criar um novo link
app.post('/newShortUrl', async (req, res) => {
  try {
    const createLinkSchema = z.object({
      original_url: z.string().url(),
      code: z.string().optional(),
      user_id: z.number()
    })

    const { original_url, code, user_id } = createLinkSchema.parse(req.body)

    // Verifique se o usuário com o user_id especificado existe no banco de dados
    const user = await prisma.user.findUnique({
      where: { user_id }
    })

    if (!user) {
      res.status(400).send('Usuário não encontrado')
      return
    }

    const short_url = `${process.env.DEV}${code}`

    // Crie o novo link com a short_url definida
    await prisma.link.create({
      data: {
        original_url,
        short_url,
        user_id
      }
    })

    res.status(201).send('Link criado com sucesso')
  } catch (error) {
    console.error('Erro no post:', error)
    res.status(500).send('Erro interno do servidor')
  }
})

app.post('/user', async (req, res) => {
  try {
    const userData: CreateUserInput = req.body

    // Adicione validação de dados aqui, por exemplo, verificando se os campos obrigatórios estão presentes e se o email é único.

    const newUser = await prisma.user.create({
      data: userData
    })

    return res.status(201).json(newUser)
  } catch (error) {
    console.error('Erro no POST do usuário:', error)
    return res.status(500).send('Erro interno do servidor')
  }
})

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany()

    return res.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return res.status(500).send('Erro interno do servidor')
  }
})

app.get('/', async (req, res) => {
  res.send(`<h1>API Rodando!</h1>`.trim())
})

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on http://localhost:${port}`)
})
