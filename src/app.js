const cors = require("cors")
const express = require("express")
const { router } = require("./routes")
const { tratarErros } = require("./middlewares/error.middleware")
const { ErroAplicacao } = require("./utils/app-error")

const app = express()

app.use(cors())
app.use(express.json())

app.use(router)

app.use((_req, _res, next) => {
  next(new ErroAplicacao("Rota nao encontrada.", 404))
})

app.use(tratarErros)

module.exports = {
  app
}
