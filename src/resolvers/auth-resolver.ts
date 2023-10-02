import jwt from 'jsonwebtoken'
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const auth = Router()

// Rota para login
auth.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Converta o email para letras minúsculas
    const lowercaseEmail = email.toLowerCase()

    // Consultar usuário com base no email
    const user = await prisma.user.findFirst({
      where: { email: lowercaseEmail }
    })

    if (!user) {
      res.status(401).json({ error: 'Usuário não encontrado' })
      return
    }

    if (user.password !== password) {
      res.status(401).json({ error: 'Credenciais inválidas' })
      return
    }

    const token = jwt.sign({ userId: user.user_id }, 'secretpassword')

    res.json({ user, token })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default auth
