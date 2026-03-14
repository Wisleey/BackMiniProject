const { z } = require("zod")

const loginSchema = z.object({
  login: z.string().trim().min(1, "Login obrigatorio."),
  senha: z.string().min(1, "Senha obrigatoria.")
})

module.exports = {
  loginSchema
}
