import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
const bcrypt = require('bcrypt')

const prisma = new PrismaClient()
const userRouter = Router()

/**
 * Types.
 */
type CreateUserInput = {
  username: string
  password: string
  email: string
}

/**
 * Rota para criar um novo usuário.
 * POST /user/
 */
userRouter.post('/', async (req, res) => {
  try {
    const { username, email, password }: CreateUserInput = req.body

    // Converte o email para letras minúsculas antes de verificar a existência.
    const dataEmail = email.toLowerCase()

    // Verifica se o usuário já existe com o email fornecido.
    const userAlreadyExist = await prisma.user.findFirst({
      where: { email: dataEmail }
    })

    if (userAlreadyExist) {
      return res.status(401).send('Este email já está cadastrado')
    }

    // Hash da senha durante o registro
    const saltRounds = 10

    // Agora 'passwordHash' contém o hash gerado da senha
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const newUser = await prisma.user.create({
      data: { password: passwordHash, email: dataEmail, username: username }
    })

    return res.status(201).json(newUser)
  } catch (error) {
    console.error('Erro no POST do usuário:', error)
    return res.status(500).send('Erro interno do servidor')
  }
})

/**
 * Rota para consultar todos os usuários.
 * GET /user/
 */
userRouter.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    return res.json({users})
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return res.status(500).send('Erro interno do servidor')
  }
})

/**
 * Rota para consultar o usuário com base no ID.
 * GET /user/:id
 */
userRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    const user = await prisma.user.findUnique({
      where: { user_id: id }
    })

    if (user) {
      return res.json(user)
    } else {
      return res.status(404).send('Usuário não encontrado')
    }
  } catch (error) {
    console.error('Erro ao buscar usuário pelo ID:', error)
    return res.status(500).send('Erro interno do servidor')
  }
})

/**
 * Rota para consultar o usuário com base no email.
 * GET /user/email/:email
 */
userRouter.get('/email/:email', async (req, res) => {
  try {
    const email = req.params.email

    const user = await prisma.user.findFirst({
      where: { email: email }
    })

    if (user) {
      return res.status(200).send('Usuário encontrado')
    } else {
      return res.status(404).send('Usuário não encontrado')
    }
  } catch (error) {
    console.error('Erro ao buscar usuário pelo email:', error)
    return res.status(500).send('Erro interno do servidor')
  }
})

export default userRouter
