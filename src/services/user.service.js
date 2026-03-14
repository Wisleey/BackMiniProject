const bcrypt = require("bcrypt")
const { prisma } = require("../config/prisma")
const { env } = require("../config/env")
const { ErroAplicacao } = require("../utils/app-error")

const selecaoPublicaUsuario = {
  id: true,
  nome: true,
  login: true,
  role: true,
  createdAt: true,
  updatedAt: true
}

class UserService {
  async criar(dados) {
    const senhaHash = await bcrypt.hash(dados.senha, env.BCRYPT_SALT_ROUNDS)

    return prisma.usuario.create({
      data: {
        nome: dados.nome,
        login: dados.login,
        senhaHash,
        role: dados.role
      },
      select: selecaoPublicaUsuario
    })
  }

  async listar() {
    return prisma.usuario.findMany({
      select: selecaoPublicaUsuario,
      orderBy: {
        createdAt: "desc"
      }
    })
  }

  async buscarPorId(id, usuarioLogado) {
    if (usuarioLogado.role !== "ADMINISTRACAO" && usuarioLogado.id !== id) {
      throw new ErroAplicacao("Voce so pode visualizar os seus proprios dados.", 403)
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: selecaoPublicaUsuario
    })

    if (!usuario) {
      throw new ErroAplicacao("Usuario nao encontrado.", 404)
    }

    return usuario
  }

  async atualizar(id, dados) {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!usuarioExistente) {
      throw new ErroAplicacao("Usuario nao encontrado.", 404)
    }

    const dadosAtualizacao = {}

    if (dados.nome) {
      dadosAtualizacao.nome = dados.nome
    }

    if (dados.login) {
      dadosAtualizacao.login = dados.login
    }

    if (dados.role) {
      dadosAtualizacao.role = dados.role
    }

    if (dados.senha) {
      dadosAtualizacao.senhaHash = await bcrypt.hash(dados.senha, env.BCRYPT_SALT_ROUNDS)
    }

    return prisma.usuario.update({
      where: { id },
      data: dadosAtualizacao,
      select: selecaoPublicaUsuario
    })
  }

  async remover(id, usuarioLogado) {
    if (usuarioLogado.id === id) {
      throw new ErroAplicacao("Nao e permitido remover o proprio usuario logado.", 400)
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        _count: {
          select: {
            pagamentosSolicitados: true,
            pagamentosAutorizados: true
          }
        }
      }
    })

    if (!usuario) {
      throw new ErroAplicacao("Usuario nao encontrado.", 404)
    }

    const possuiVinculos =
      usuario._count.pagamentosSolicitados > 0 || usuario._count.pagamentosAutorizados > 0

    if (possuiVinculos) {
      throw new ErroAplicacao(
        "Nao e possivel remover usuario com pagamentos vinculados. Atualize o usuario em vez de remover.",
        409
      )
    }

    await prisma.usuario.delete({
      where: { id }
    })

    return {
      mensagem: "Usuario removido com sucesso."
    }
  }
}

module.exports = {
  userService: new UserService()
}
