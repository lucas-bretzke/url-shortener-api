import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const userRouter = Router()

type CreateUserInput = {
  username: string
  password: string
  email: string
}

// Rota para criar um novo usuário
userRouter.post('/', async (req, res) => {
  try {
    const userData: CreateUserInput = req.body

    userData.email = userData.email.toLowerCase()

    const userAlreadyExist = await prisma.user.findFirst({
      where: { email: userData.email }
    })

    if (userAlreadyExist) {
      return res.status(401).send('Este email já está cadastrado')
    }

    const newUser = await prisma.user.create({
      data: userData
    })

    return res.status(201).json(newUser)
  } catch (error) {
    console.error('Erro no POST do usuário:', error)
    return res.status(500).send('Erro interno do servidor')
  }
})

userRouter.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany()
    res.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    res.status(500).send('Erro interno do servidor')
  }
})

userRouter.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)

    // Consulte o usuário com base no ID
    const user = await prisma.user.findUnique({
      where: { user_id: id }
    })

    user ? res.json(user) : res.status(404).send('Usuário não encontrado')
  } catch (error) {
    console.error('Erro ao buscar usuário pelo ID:', error)
    res.status(500).send('Erro interno do servidor')
  }
})

userRouter.get('/email/:email', async (req, res) => {
  try {
    const email = req.params.email

    const user = await prisma.user.findFirst({
      where: { email: email }
    })

    user
      ? res.status(200).send('Usuário encontrado')
      : res.status(404).send('Usuário não encontrado')
  } catch (error) {
    console.error('Erro ao buscar usuário pelo email:', error)
    res.status(500).send('Erro interno do servidor')
  }
})

export default userRouter
