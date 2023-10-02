import { z } from 'zod'
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const shortUrl = Router()

// Rota para criar um novo link
shortUrl.post('/', async (req, res) => {
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

    const short_url = `${process.env.BACKEND_API_URL}/${code}`

    // Crie o novo link com a short_url definida
    await prisma.link.create({
      data: {
        original_url,
        short_url,
        user_id
      }
    })

    return res.status(201).send('Link criado com sucesso')
  } catch (error) {
    console.error('Erro no post:', error)
    res.status(500).send('Erro interno do servidor')
  }
})

// Deletar short_url
shortUrl.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)

    const link = await prisma.link.findFirst({
      where: { link_id: id }
    })

    if (!link) {
      res.status(404).send('URL not found')
      return
    }

    await prisma.link.delete({
      where: { link_id: link.link_id }
    })

    return res.status(204).send('short_url deleted')
  } catch (error) {
    console.error('Erro na exclusão do link:', error)
    res.status(500).send('Erro interno do servidor')
  }
})

shortUrl.get('/:userId', async (req, res) => {
  try {
    const id = parseInt(req.params.userId)

    const links = await prisma.link.findMany({
      where: { user_id: id }
    })

    res.send([links])
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    res.status(500).send('Erro interno do servidor')
  }
})


export default shortUrl