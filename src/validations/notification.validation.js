const { z } = require("zod")

const schemaIdNotificacao = z.object({
  id: z.coerce.number().int().positive("Id invalido.")
})

const schemaListarNotificacoes = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
  somenteNaoLidas: z
    .enum(["true", "false"])
    .transform((valor) => valor === "true")
    .optional()
})

module.exports = {
  schemaIdNotificacao,
  schemaListarNotificacoes
}
