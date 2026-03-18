const { prisma } = require("../config/prisma")
const { ErroAplicacao } = require("../utils/app-error")

class NotificationService {
  formatarParaCliente(notificacao) {
    if (!notificacao) {
      return null
    }

    return {
      id: notificacao.id,
      tipo: notificacao.tipo,
      titulo: notificacao.titulo,
      mensagem: notificacao.mensagem,
      payload: notificacao.payload,
      lidaEm: notificacao.lidaEm,
      createdAt: notificacao.createdAt
    }
  }

  async criarRejeicaoPagamento(tx, pagamento, autorizador) {
    const notificacao = await tx.notificacao.create({
      data: {
        usuarioId: pagamento.solicitanteId,
        tipo: "PAGAMENTO_REJEITADO",
        titulo: "Pagamento rejeitado",
        mensagem: `O pagamento para ${pagamento.razaoSocial} foi rejeitado por ${autorizador.nome}.`,
        payload: {
          pagamentoId: pagamento.id,
          razaoSocial: pagamento.razaoSocial,
          autorizadorNome: autorizador.nome,
          motivoRejeicao: pagamento.motivoRejeicao
        }
      }
    })

    return this.formatarParaCliente(notificacao)
  }

  async listar(usuarioLogado, filtros) {
    const limiteNormalizado = Number(filtros.limit ?? 10)
    const limite = Number.isInteger(limiteNormalizado) && limiteNormalizado > 0
      ? limiteNormalizado
      : 10

    const somenteNaoLidas =
      filtros.somenteNaoLidas === true || filtros.somenteNaoLidas === "true"

    const where = {
      usuarioId: usuarioLogado.id
    }

    if (somenteNaoLidas) {
      where.lidaEm = null
    }

    const [notificacoes, naoLidas] = await prisma.$transaction([
      prisma.notificacao.findMany({
        where,
        orderBy: {
          createdAt: "desc"
        },
        take: limite
      }),
      prisma.notificacao.count({
        where: {
          usuarioId: usuarioLogado.id,
          lidaEm: null
        }
      })
    ])

    return {
      notificacoes: notificacoes.map((item) => this.formatarParaCliente(item)),
      meta: {
        naoLidas
      }
    }
  }

  async marcarComoLida(idNotificacao, usuarioLogado) {
    const notificacao = await prisma.notificacao.findUnique({
      where: { id: idNotificacao }
    })

    if (!notificacao || notificacao.usuarioId !== usuarioLogado.id) {
      throw new ErroAplicacao("Notificacao nao encontrada.", 404)
    }

    const notificacaoAtualizada = await prisma.notificacao.update({
      where: { id: idNotificacao },
      data: {
        lidaEm: notificacao.lidaEm || new Date()
      }
    })

    return this.formatarParaCliente(notificacaoAtualizada)
  }

  async marcarTodasComoLidas(usuarioLogado) {
    await prisma.notificacao.updateMany({
      where: {
        usuarioId: usuarioLogado.id,
        lidaEm: null
      },
      data: {
        lidaEm: new Date()
      }
    })

    const naoLidas = await prisma.notificacao.count({
      where: {
        usuarioId: usuarioLogado.id,
        lidaEm: null
      }
    })

    return {
      mensagem: "Notificacoes marcadas como lidas.",
      meta: {
        naoLidas
      }
    }
  }
}

module.exports = {
  notificationService: new NotificationService()
}
