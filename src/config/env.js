const path = require("path")
const dotenv = require("dotenv")
const { z } = require("zod")

dotenv.config({
  path: path.resolve(process.cwd(), ".env")
})

const schemaAmbiente = z.object({
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, "DATABASE_URL obrigatoria."),
  JWT_SECRET: z.string().min(10, "JWT_SECRET deve ter ao menos 10 caracteres."),
  JWT_EXPIRES_IN: z.string().min(1).default("8h"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(15).default(10)
})

const resultado = schemaAmbiente.safeParse(process.env)

if (!resultado.success) {
  console.error("Variaveis de ambiente invalidas:", resultado.error.flatten().fieldErrors)
  process.exit(1)
}

module.exports = {
  env: resultado.data
}
