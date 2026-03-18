const { prisma } = require("../config/prisma")
const { notificationService } = require("./notification.service")
const { notificationStreamService } = require("./notification-stream.service")
const { ErroAplicacao } = require("../utils/app-error")

const includePagamento = {
  solicitante: {
    select: {
      id: true,
      nome: true,
      login: true,
      role: true
    }
  },
  autorizador: {
    select: {
      id: true,
      nome: true,
      login: true,
      role: true
    }
  }
}

function ajustarInicioDoDia(data) {
  const dataNormalizada = new Date(data)
  dataNormalizada.setUTCHours(0, 0, 0, 0)
  return dataNormalizada
}

function ajustarFimDoDia(data) {
  const dataNormalizada = new Date(data)
  dataNormalizada.setUTCHours(23, 59, 59, 999)
  return dataNormalizada
}

class PaymentService {
  async criar(dados, usuarioLogado) {
    return prisma.pagamento.create({
      data: {
        cnpjFavorecido: dados.cnpjFavorecido,
        razaoSocial: dados.razaoSocial,
        valor: dados.valor,
        descricaoServico: dados.descricaoServico,
        solicitanteId: usuarioLogado.id
      },
      include: includePagamento
    })
  }

  async listarMeusPagamentos(usuarioLogado) {
    return prisma.pagamento.findMany({
      where: {
        solicitanteId: usuarioLogado.id
      },
      include: includePagamento,
      orderBy: {
        dataRegistro: "desc"
      }
    })
  }

  async listarPendentes() {
    return prisma.pagamento.findMany({
      where: {
        status: "PENDENTE"
      },
      include: includePagamento,
      orderBy: {
        dataRegistro: "asc"
      }
    })
  }

  async autorizar(idPagamento, usuarioLogado) {
    const pagamento = await prisma.pagamento.findUnique({
      where: { id: idPagamento }
    })

    if (!pagamento) {
      throw new ErroAplicacao("Pagamento nao encontrado.", 404)
    }

    if (pagamento.status !== "PENDENTE") {
      throw new ErroAplicacao(
        "Somente pagamentos pendentes podem ser autorizados.",
        409
      )
    }

    return prisma.pagamento.update({
      where: { id: idPagamento },
      data: {
        status: "AUTORIZADO",
        autorizadorId: usuarioLogado.id,
        dataDecisao: new Date(),
        motivoRejeicao: null
      },
      include: includePagamento
    })
  }

  async rejeitar(idPagamento, dados, usuarioLogado) {
    const { pagamentoAtualizado, notificacao } = await prisma.$transaction(async (tx) => {
      const pagamento = await tx.pagamento.findUnique({
        where: { id: idPagamento }
      })

      if (!pagamento) {
        throw new ErroAplicacao("Pagamento nao encontrado.", 404)
      }

      if (pagamento.status !== "PENDENTE") {
        throw new ErroAplicacao(
          "Somente pagamentos pendentes podem ser rejeitados.",
          409
        )
      }

      const pagamentoAtualizado = await tx.pagamento.update({
        where: { id: idPagamento },
        data: {
          status: "REJEITADO",
          autorizadorId: usuarioLogado.id,
          dataDecisao: new Date(),
          motivoRejeicao: dados.motivoRejeicao
        },
        include: includePagamento
      })

      const notificacao = await notificationService.criarRejeicaoPagamento(
        tx,
        pagamentoAtualizado,
        usuarioLogado
      )

      return {
        pagamentoAtualizado,
        notificacao
      }
    })

    notificationStreamService.enviarEvento(
      pagamentoAtualizado.solicitanteId,
      "notification",
      notificacao
    )

    return pagamentoAtualizado
  }

  async historico(filtros, usuarioLogado) {
    const where = {}

    if (filtros.status) {
      where.status = filtros.status
    }

    if (filtros.dataInicio || filtros.dataFim) {
      where.dataRegistro = {}
    }

    if (filtros.dataInicio) {
      where.dataRegistro.gte = ajustarInicioDoDia(filtros.dataInicio)
    }

    if (filtros.dataFim) {
      where.dataRegistro.lte = ajustarFimDoDia(filtros.dataFim)
    }

    if (usuarioLogado.role === "REGISTRO") {
      where.solicitanteId = usuarioLogado.id
    } else if (filtros.solicitanteId) {
      const solicitanteIdNumero = Number(filtros.solicitanteId)

      if (Number.isNaN(solicitanteIdNumero)) {
        throw new Error("solicitanteId invalido.")
      }

      where.solicitanteId = solicitanteIdNumero
    }

    return prisma.pagamento.findMany({
      where,
      include: includePagamento,
      orderBy: {
        dataRegistro: "desc"
      }
    })
  }
}

module.exports = {
  paymentService: new PaymentService()
}
