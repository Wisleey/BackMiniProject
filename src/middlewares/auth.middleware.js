const jwt = require("jsonwebtoken")
const { prisma } = require("../config/prisma")
const { env } = require("../config/env")
const { ErroAplicacao } = require("../utils/app-error")

async function autenticar(req, _res, next) {
  try {
    const cabecalhoAutorizacao = req.headers.authorization

    if (!cabecalhoAutorizacao) {
      throw new ErroAplicacao("Token nao informado.", 401)
    }

    const [tipo, token] = cabecalhoAutorizacao.split(" ")

    if (tipo !== "Bearer" || !token) {
      throw new ErroAplicacao("Token invalido.", 401)
    }

    const payload = jwt.verify(token, env.JWT_SECRET)

    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        nome: true,
        login: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!usuario) {
      throw new ErroAplicacao("Usuario do token nao encontrado.", 401)
    }

    req.usuario = usuario
    return next()
  } catch (erro) {
    if (erro.name === "JsonWebTokenError" || erro.name === "TokenExpiredError") {
      return next(new ErroAplicacao("Token invalido ou expirado.", 401))
    }

    return next(erro)
  }
}

module.exports = {
  autenticar
}
