import jwt from 'jsonwebtoken'
import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const bcrypt = require('bcrypt')
const prisma = new PrismaClient()
const auth = Router()

// Rota para login
auth.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Converte o email para letras minúsculas
    const lowercaseEmail = email.toLowerCase()

    // Consultar usuário com base no email
    const user = await prisma.user.findFirst({
      where: { email: lowercaseEmail }
    })

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' })
    }

    const passwordHash = await bcrypt.compare(password, user.password)

    const teste = user.password

    if (!passwordHash) {
      res
        .status(401)
        .json({ error: 'Credenciais inválidas', passwordHash, teste })
      return
    }

    res.json({ user })
  } catch (error) {
    console.error('Erro no login:', error)
    res.status(500).json({ error: 'Erro interno do servidor' })
  }
})

export default auth
