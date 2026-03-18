const state = {
  users: [],
  payments: [],
  notifications: [],
  nextUserId: 1,
  nextPaymentId: 1,
  nextNotificationId: 1
}

function clone(value) {
  return structuredClone(value)
}

function recalcularContadores() {
  state.nextUserId = state.users.reduce((maior, item) => Math.max(maior, item.id), 0) + 1
  state.nextPaymentId = state.payments.reduce((maior, item) => Math.max(maior, item.id), 0) + 1
  state.nextNotificationId =
    state.notifications.reduce((maior, item) => Math.max(maior, item.id), 0) + 1
}

function selecionarCampos(registro, select) {
  if (!registro) {
    return null
  }

  if (!select) {
    return clone(registro)
  }

  const resultado = {}

  for (const [campo, valor] of Object.entries(select)) {
    if (valor === true) {
      resultado[campo] = clone(registro[campo])
      continue
    }

    if (campo === "_count" && valor?.select) {
      resultado._count = {}

      if (valor.select.pagamentosSolicitados) {
        resultado._count.pagamentosSolicitados = state.payments.filter(
          (pagamento) => pagamento.solicitanteId === registro.id
        ).length
      }

      if (valor.select.pagamentosAutorizados) {
        resultado._count.pagamentosAutorizados = state.payments.filter(
          (pagamento) => pagamento.autorizadorId === registro.id
        ).length
      }
    }
  }

  return resultado
}

function aplicarIncludePagamento(pagamento, include) {
  if (!pagamento) {
    return null
  }

  const resultado = clone(pagamento)

  if (include?.solicitante) {
    const solicitante = state.users.find((usuario) => usuario.id === pagamento.solicitanteId) || null
    resultado.solicitante = selecionarCampos(solicitante, include.solicitante.select)
  }

  if (include?.autorizador) {
    const autorizador =
      state.users.find((usuario) => usuario.id === pagamento.autorizadorId) || null
    resultado.autorizador = selecionarCampos(autorizador, include.autorizador.select)
  }

  return resultado
}

function filtrarNotificacoes(where = {}) {
  return state.notifications.filter((notificacao) => {
    if (where.usuarioId && notificacao.usuarioId !== where.usuarioId) {
      return false
    }

    if (where.lidaEm === null && notificacao.lidaEm !== null) {
      return false
    }

    return true
  })
}

function ordenarRegistros(registros, orderBy) {
  if (!orderBy) {
    return registros
  }

  const [[campo, direcao]] = Object.entries(orderBy)
  const fator = direcao === "asc" ? 1 : -1

  return registros.sort((a, b) => {
    const valorA = a[campo] instanceof Date ? a[campo].getTime() : a[campo]
    const valorB = b[campo] instanceof Date ? b[campo].getTime() : b[campo]

    if (valorA === valorB) {
      return 0
    }

    return valorA > valorB ? fator : fator * -1
  })
}

function filtrarPagamentos(where = {}) {
  return state.payments.filter((pagamento) => {
    if (where.status && pagamento.status !== where.status) {
      return false
    }

    if (where.solicitanteId && pagamento.solicitanteId !== where.solicitanteId) {
      return false
    }

    if (where.dataRegistro?.gte && pagamento.dataRegistro < where.dataRegistro.gte) {
      return false
    }

    if (where.dataRegistro?.lte && pagamento.dataRegistro > where.dataRegistro.lte) {
      return false
    }

    return true
  })
}

function resetMockDatabase(dados = {}) {
  state.users = clone(dados.users || [])
  state.payments = clone(dados.payments || [])
  state.notifications = clone(dados.notifications || [])
  recalcularContadores()

  for (const metodo of [
    prisma.usuario.findUnique,
    prisma.usuario.findMany,
    prisma.usuario.create,
    prisma.usuario.update,
    prisma.usuario.delete,
    prisma.usuario.upsert,
    prisma.pagamento.findUnique,
    prisma.pagamento.findMany,
    prisma.pagamento.create,
    prisma.pagamento.update,
    prisma.notificacao.findUnique,
    prisma.notificacao.findMany,
    prisma.notificacao.create,
    prisma.notificacao.update,
    prisma.notificacao.updateMany,
    prisma.notificacao.count,
    prisma.$transaction,
    prisma.$disconnect
  ]) {
    metodo.mockClear()
  }
}

const prisma = {
  usuario: {
    findUnique: jest.fn(async ({ where, select }) => {
      const usuario = state.users.find((item) => {
        if (where.id !== undefined) {
          return item.id === where.id
        }

        if (where.login !== undefined) {
          return item.login === where.login
        }

        return false
      })

      return selecionarCampos(usuario, select)
    }),
    findMany: jest.fn(async ({ select, orderBy } = {}) => {
      const usuarios = ordenarRegistros([...state.users], orderBy)
      return usuarios.map((usuario) => selecionarCampos(usuario, select))
    }),
    create: jest.fn(async ({ data, select }) => {
      const agora = new Date()
      const usuario = {
        id: state.nextUserId++,
        nome: data.nome,
        login: data.login,
        senhaHash: data.senhaHash,
        role: data.role,
        createdAt: agora,
        updatedAt: agora
      }

      state.users.push(usuario)
      return selecionarCampos(usuario, select)
    }),
    update: jest.fn(async ({ where, data, select }) => {
      const indice = state.users.findIndex((usuario) => usuario.id === where.id)

      if (indice < 0) {
        return null
      }

      state.users[indice] = {
        ...state.users[indice],
        ...data,
        updatedAt: new Date()
      }

      return selecionarCampos(state.users[indice], select)
    }),
    delete: jest.fn(async ({ where }) => {
      const indice = state.users.findIndex((usuario) => usuario.id === where.id)

      if (indice < 0) {
        return null
      }

      const [removido] = state.users.splice(indice, 1)
      return clone(removido)
    }),
    upsert: jest.fn(async ({ where, update, create }) => {
      const usuarioExistente = state.users.find((usuario) => usuario.login === where.login)

      if (usuarioExistente) {
        Object.assign(usuarioExistente, update, {
          updatedAt: new Date()
        })

        return clone(usuarioExistente)
      }

      const agora = new Date()
      const novoUsuario = {
        id: state.nextUserId++,
        ...create,
        createdAt: agora,
        updatedAt: agora
      }

      state.users.push(novoUsuario)
      return clone(novoUsuario)
    })
  },
  pagamento: {
    findUnique: jest.fn(async ({ where, include } = {}) => {
      const pagamento = state.payments.find((item) => item.id === where.id) || null
      return include ? aplicarIncludePagamento(pagamento, include) : clone(pagamento)
    }),
    findMany: jest.fn(async ({ where, include, orderBy } = {}) => {
      const pagamentos = ordenarRegistros(filtrarPagamentos(where), orderBy)
      return pagamentos.map((pagamento) =>
        include ? aplicarIncludePagamento(pagamento, include) : clone(pagamento)
      )
    }),
    create: jest.fn(async ({ data, include }) => {
      const agora = new Date()
      const pagamento = {
        id: state.nextPaymentId++,
        cnpjFavorecido: data.cnpjFavorecido,
        razaoSocial: data.razaoSocial,
        valor: data.valor,
        descricaoServico: data.descricaoServico,
        dataRegistro: agora,
        status: "PENDENTE",
        solicitanteId: data.solicitanteId,
        autorizadorId: null,
        dataDecisao: null,
        motivoRejeicao: null,
        createdAt: agora,
        updatedAt: agora
      }

      state.payments.push(pagamento)
      return include ? aplicarIncludePagamento(pagamento, include) : clone(pagamento)
    }),
    update: jest.fn(async ({ where, data, include }) => {
      const indice = state.payments.findIndex((pagamento) => pagamento.id === where.id)

      if (indice < 0) {
        return null
      }

      state.payments[indice] = {
        ...state.payments[indice],
        ...data,
        updatedAt: new Date()
      }

      return include
        ? aplicarIncludePagamento(state.payments[indice], include)
        : clone(state.payments[indice])
    })
  },
  notificacao: {
    findUnique: jest.fn(async ({ where }) => {
      return clone(state.notifications.find((item) => item.id === where.id) || null)
    }),
    findMany: jest.fn(async ({ where, orderBy, take } = {}) => {
      const notificacoes = ordenarRegistros(filtrarNotificacoes(where), orderBy)
      const resultado = typeof take === "number" ? notificacoes.slice(0, take) : notificacoes
      return clone(resultado)
    }),
    create: jest.fn(async ({ data }) => {
      const notificacao = {
        id: state.nextNotificationId++,
        usuarioId: data.usuarioId,
        tipo: data.tipo,
        titulo: data.titulo,
        mensagem: data.mensagem,
        payload: data.payload || null,
        lidaEm: data.lidaEm || null,
        createdAt: new Date()
      }

      state.notifications.push(notificacao)
      return clone(notificacao)
    }),
    update: jest.fn(async ({ where, data }) => {
      const indice = state.notifications.findIndex((notificacao) => notificacao.id === where.id)

      if (indice < 0) {
        return null
      }

      state.notifications[indice] = {
        ...state.notifications[indice],
        ...data
      }

      return clone(state.notifications[indice])
    }),
    updateMany: jest.fn(async ({ where, data }) => {
      let contador = 0

      for (let indice = 0; indice < state.notifications.length; indice += 1) {
        const notificacao = state.notifications[indice]

        if (where.usuarioId && notificacao.usuarioId !== where.usuarioId) {
          continue
        }

        if (where.lidaEm === null && notificacao.lidaEm !== null) {
          continue
        }

        state.notifications[indice] = {
          ...notificacao,
          ...data
        }
        contador += 1
      }

      return { count: contador }
    }),
    count: jest.fn(async ({ where } = {}) => {
      return filtrarNotificacoes(where).length
    })
  },
  $transaction: jest.fn(async (entrada) => {
    if (typeof entrada === "function") {
      return entrada(prisma)
    }

    return Promise.all(entrada)
  }),
  $disconnect: jest.fn(async () => undefined)
}

function getMockDatabase() {
  return clone(state)
}

module.exports = {
  prisma,
  resetMockDatabase,
  getMockDatabase
}
