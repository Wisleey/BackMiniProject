const { Prisma } = require("@prisma/client")
const { ZodError } = require("zod")
const { ErroAplicacao } = require("../utils/app-error")

function tratarErros(erro, _req, res, _next) {
  if (erro instanceof ZodError) {
    return res.status(400).json({
      mensagem: "Erro de validacao.",
      erros: erro.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensagem: issue.message
      }))
    })
  }

  if (erro instanceof ErroAplicacao) {
    return res.status(erro.statusCode).json({
      mensagem: erro.message,
      detalhes: erro.detalhes
    })
  }

  if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    if (erro.code === "P2002") {
      return res.status(409).json({
        mensagem: "Ja existe registro com os dados informados."
      })
    }
  }

  console.error(erro)

  return res.status(500).json({
    mensagem: "Erro interno do servidor."
  })
}

module.exports = {
  tratarErros
}
