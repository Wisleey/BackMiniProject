class ErroAplicacao extends Error {
  constructor(mensagem, statusCode = 400, detalhes = null) {
    super(mensagem)
    this.name = "ErroAplicacao"
    this.statusCode = statusCode
    this.detalhes = detalhes
  }
}

module.exports = {
  ErroAplicacao
}
