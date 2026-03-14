const { StatusPagamento } = require("@prisma/client")
const { z } = require("zod")
const { limparCnpj, validarCnpj } = require("../utils/cnpj")

const schemaIdPagamento = z.object({
  id: z.coerce.number().int().positive("Id invalido.")
})

const schemaCriarPagamento = z.object({
  cnpjFavorecido: z
    .string()
    .transform((valor) => limparCnpj(valor))
    .refine((valor) => valor.length === 14, "CNPJ deve conter 14 digitos.")
    .refine((valor) => validarCnpj(valor), "CNPJ invalido."),
  razaoSocial: z
    .string()
    .trim()
    .min(3, "Razao social deve ter ao menos 3 caracteres.")
    .max(200, "Razao social muito longa."),
  valor: z.coerce.number().positive("Valor do pagamento deve ser maior que zero."),
  descricaoServico: z
    .string()
    .trim()
    .min(3, "Descricao do servico deve ter ao menos 3 caracteres.")
    .max(500, "Descricao do servico muito longa.")
})

const schemaRejeitarPagamento = z.object({
  motivoRejeicao: z
    .string()
    .trim()
    .min(3, "Motivo da rejeicao obrigatorio.")
    .max(500, "Motivo da rejeicao muito longo.")
})

const schemaHistoricoPagamentos = z
  .object({
    dataInicio: z.coerce.date({ message: "Data de inicio invalida." }).optional(),
    dataFim: z.coerce.date({ message: "Data fim invalida." }).optional(),
    status: z
      .nativeEnum(StatusPagamento, {
        errorMap: () => ({ message: "Status invalido." })
      })
      .optional(),
    solicitanteId: z.coerce.number().int().positive("Solicitante invalido.").optional()
  })
  .refine(
    (dados) => {
      if (!dados.dataInicio || !dados.dataFim) {
        return true
      }

      return dados.dataFim >= dados.dataInicio
    },
    {
      message: "Data fim deve ser maior ou igual a data inicio.",
      path: ["dataFim"]
    }
  )

module.exports = {
  schemaIdPagamento,
  schemaCriarPagamento,
  schemaRejeitarPagamento,
  schemaHistoricoPagamentos
}
