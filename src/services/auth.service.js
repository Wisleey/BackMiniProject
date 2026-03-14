const bcrypt = require("bcrypt")
const { prisma } = require("../config/prisma")
const { ErroAplicacao } = require("../utils/app-error")
const { gerarToken } = require("../utils/jwt")

class AuthService {
  async login({ login, senha }) {
    const usuario = await prisma.usuario.findUnique({
      where: { login },
      select: {
        id: true,
        nome: true,
        login: true,
        senhaHash: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!usuario) {
      throw new ErroAplicacao("Login ou senha invalidos.", 401)
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash)

    if (!senhaValida) {
      throw new ErroAplicacao("Login ou senha invalidos.", 401)
    }

    const token = gerarToken(usuario)

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        role: usuario.role,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt
      }
    }
  }
}

module.exports = {
  authService: new AuthService()
}
