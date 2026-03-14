const { app } = require("./app")
const { env } = require("./config/env")
const { prisma } = require("./config/prisma")

const servidor = app.listen(env.PORT, () => {
  console.log(`Servidor executando na porta ${env.PORT}.`)
})

async function encerrarServidor() {
  console.log("Encerrando servidor...")
  await prisma.$disconnect()
  servidor.close(() => {
    process.exit(0)
  })
}

process.on("SIGINT", encerrarServidor)
process.on("SIGTERM", encerrarServidor)
