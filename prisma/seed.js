const bcrypt = require("bcrypt")
const { PrismaClient, Role } = require("@prisma/client")
require("dotenv").config()

const prisma = new PrismaClient()

async function criarOuAtualizarUsuario({ nome, login, senha, role }) {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10)
  const senhaHash = await bcrypt.hash(senha, saltRounds)

  return prisma.usuario.upsert({
    where: { login },
    update: {
      nome,
      senhaHash,
      role
    },
    create: {
      nome,
      login,
      senhaHash,
      role
    }
  })
}

async function main() {
  await criarOuAtualizarUsuario({
    nome: process.env.ADMIN_NOME || "Administrador Inicial",
    login: process.env.ADMIN_LOGIN || "admin",
    senha: process.env.ADMIN_SENHA || "Admin@123",
    role: Role.ADMINISTRACAO
  })

  await criarOuAtualizarUsuario({
    nome: process.env.REGISTRO_NOME || "Usuario Registro",
    login: process.env.REGISTRO_LOGIN || "registro",
    senha: process.env.REGISTRO_SENHA || "Registro@123",
    role: Role.REGISTRO
  })

  await criarOuAtualizarUsuario({
    nome: process.env.AUTORIZACAO_NOME || "Usuario Autorizacao",
    login: process.env.AUTORIZACAO_LOGIN || "autorizacao",
    senha: process.env.AUTORIZACAO_SENHA || "Autorizacao@123",
    role: Role.AUTORIZACAO
  })

  console.log("Seed executado com sucesso.")
}

main()
  .catch((erro) => {
    console.error("Erro ao executar seed:", erro)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
