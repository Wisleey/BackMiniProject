class NotificationStreamService {
  constructor() {
    this.conexoesPorUsuario = new Map()
  }

  adicionarConexao(usuarioId, resposta) {
    const chaveUsuario = Number(usuarioId)
    const conexoes = this.conexoesPorUsuario.get(chaveUsuario) || new Set()
    conexoes.add(resposta)
    this.conexoesPorUsuario.set(chaveUsuario, conexoes)
  }

  removerConexao(usuarioId, resposta) {
    const chaveUsuario = Number(usuarioId)
    const conexoes = this.conexoesPorUsuario.get(chaveUsuario)

    if (!conexoes) {
      return
    }

    conexoes.delete(resposta)

    if (conexoes.size === 0) {
      this.conexoesPorUsuario.delete(chaveUsuario)
    }
  }

  enviarEvento(usuarioId, nomeEvento, payload) {
    const conexoes = this.conexoesPorUsuario.get(Number(usuarioId))

    if (!conexoes || conexoes.size === 0) {
      return
    }

    const dadosSerializados = JSON.stringify(payload)

    for (const resposta of conexoes) {
      resposta.write(`event: ${nomeEvento}\n`)
      resposta.write(`data: ${dadosSerializados}\n\n`)
    }
  }
}

module.exports = {
  notificationStreamService: new NotificationStreamService()
}
