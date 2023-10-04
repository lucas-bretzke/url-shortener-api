import { z } from 'zod'
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const shortUrl = Router()

/**
 * Types.
 */
const createLinkSchema = z.object({
  original_url: z.string().url(),
  code: z.string(),
  user_id: z.number(),
  is_favorite: z.boolean().optional().default(false),
  description: z.string()
})

/**
 * Rota para criar um novo link encurtado.
 * POST /shortUrl/
 */
shortUrl.post('/', async (req, res) => {
  try {
    const { original_url, code, user_id, is_favorite, description } =
      createLinkSchema.parse(req.body)

    // Verifica se o usuário com o user_id especificado existe no banco de dados.
    const user = await prisma.user.findUnique({
      where: { user_id }
    })

    if (!user) {
      res.status(400).send('Usuário não encontrado')
      return
    }

    const short_url = `${process.env.BACKEND_API_URL}/${code}`

    // Cria o novo link com a short_url definida.
    await prisma.link.create({
      data: {
        user_id,
        short_url,
        is_favorite,
        description,
        original_url
      }
    })

    return res.status(201).send('Link criado com sucesso')
  } catch (error) {
    console.error('Erro no post:', error)
    res.status(500).send('Erro interno do servidor')
  }
})

// Rota para atualizar um link encurtado.
// PUT /shortUrl/:id
shortUrl.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { is_favorite, description } = req.body

    const link = await prisma.link.findUnique({
      where: { link_id: id }
    })

    if (!link) return res.status(404).send('Link not found')

    await prisma.link.update({
      where: { link_id: id },
      data: {
        is_favorite,
        description
      }
    })

    res.status(200).send('Link updated successfully')
  } catch (error) {
    console.error('Error in PUT:', error)
    res.status(500).send('Internal Server Error')
  }
})

/**
 * Rota para deletar um link encurtado.
 * DELETE /shortUrl/:id
 */
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

/**
 * Rota para buscar links encurtados de um usuário com base no ID do usuário.
 * GET /shortUrl/:userId
 */
shortUrl.get('/:userId', async (req, res) => {
  try {
    const id = parseInt(req.params.userId)

    const links = await prisma.link.findMany({
      where: { user_id: id }
    })

    res.json(links)
  } catch (error) {
    console.error('Erro ao buscar links encurtados:', error)
    res.status(500).send('Erro interno do servidor')
  }
})

export default shortUrl
