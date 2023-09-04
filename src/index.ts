import { PrismaClient } from '@prisma/client'
import express from 'express'
import redis from './lib/cache'

const prisma = new PrismaClient()

const app = express()
const port = process.env.PORT || 3000

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

app.get('/', async (req, res) => {
  res.send(
    `
  <h1>Todo REST API</h1>
  <h2>Available Routes</h2>
  <pre>
    GET, POST /todos
    GET, PUT, DELETE /todos/:id
  </pre>
  `.trim()
  )
})

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
