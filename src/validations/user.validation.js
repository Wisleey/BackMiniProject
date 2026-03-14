const { Role } = require("@prisma/client")
const { z } = require("zod")

const schemaIdUsuario = z.object({
  id: z.coerce.number().int().positive("Id invalido.")
})

const schemaCriarUsuario = z.object({
  nome: z.string().trim().min(3, "Nome deve ter ao menos 3 caracteres.").max(150, "Nome muito longo."),
  login: z.string().trim().min(3, "Login deve ter ao menos 3 caracteres.").max(100, "Login muito longo."),
  senha: z
    .string()
    .min(8, "Senha deve ter ao menos 8 caracteres.")
    .max(100, "Senha muito longa."),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: "Perfil invalido." })
  })
})

const schemaAtualizarUsuario = z
  .object({
    nome: z.string().trim().min(3, "Nome deve ter ao menos 3 caracteres.").max(150, "Nome muito longo.").optional(),
    login: z.string().trim().min(3, "Login deve ter ao menos 3 caracteres.").max(100, "Login muito longo.").optional(),
    senha: z
      .string()
      .min(8, "Senha deve ter ao menos 8 caracteres.")
      .max(100, "Senha muito longa.")
      .optional(),
    role: z
      .nativeEnum(Role, {
        errorMap: () => ({ message: "Perfil invalido." })
      })
      .optional()
  })
  .refine((dados) => Object.keys(dados).length > 0, {
    message: "Informe ao menos um campo para atualizar."
  })

module.exports = {
  schemaIdUsuario,
  schemaCriarUsuario,
  schemaAtualizarUsuario
}
