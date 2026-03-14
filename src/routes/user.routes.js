const { Router } = require("express")
const { userController } = require("../controllers/user.controller")
const { autenticar } = require("../middlewares/auth.middleware")
const { autorizarPerfis } = require("../middlewares/role.middleware")
const { validar } = require("../middlewares/validate.middleware")
const {
  schemaIdUsuario,
  schemaCriarUsuario,
  schemaAtualizarUsuario
} = require("../validations/user.validation")

const userRoutes = Router()

userRoutes.use(autenticar)

userRoutes.post(
  "/",
  autorizarPerfis("ADMINISTRACAO"),
  validar(schemaCriarUsuario),
  (req, res, next) => userController.criar(req, res, next)
)

userRoutes.get("/", autorizarPerfis("ADMINISTRACAO"), (req, res, next) =>
  userController.listar(req, res, next)
)

userRoutes.get("/:id", validar(schemaIdUsuario, "params"), (req, res, next) =>
  userController.buscarPorId(req, res, next)
)

userRoutes.put(
  "/:id",
  autorizarPerfis("ADMINISTRACAO"),
  validar(schemaIdUsuario, "params"),
  validar(schemaAtualizarUsuario),
  (req, res, next) => userController.atualizar(req, res, next)
)

userRoutes.delete(
  "/:id",
  autorizarPerfis("ADMINISTRACAO"),
  validar(schemaIdUsuario, "params"),
  (req, res, next) => userController.remover(req, res, next)
)

module.exports = {
  userRoutes
}
