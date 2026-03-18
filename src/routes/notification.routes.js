const { Router } = require("express")
const { notificationController } = require("../controllers/notification.controller")
const { autenticar } = require("../middlewares/auth.middleware")
const { validar } = require("../middlewares/validate.middleware")
const {
  schemaIdNotificacao,
  schemaListarNotificacoes
} = require("../validations/notification.validation")

const notificationRoutes = Router()

notificationRoutes.use(autenticar)

notificationRoutes.get(
  "/",
  validar(schemaListarNotificacoes, "query"),
  (req, res, next) => notificationController.listar(req, res, next)
)

notificationRoutes.get("/stream", (req, res, next) =>
  notificationController.stream(req, res, next)
)

notificationRoutes.patch(
  "/read-all",
  (req, res, next) => notificationController.marcarTodasComoLidas(req, res, next)
)

notificationRoutes.patch(
  "/:id/read",
  validar(schemaIdNotificacao, "params"),
  (req, res, next) => notificationController.marcarComoLida(req, res, next)
)

module.exports = {
  notificationRoutes
}
