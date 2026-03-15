const { Router } = require("express")
const { paymentController } = require("../controllers/payment.controller")
const { autenticar } = require("../middlewares/auth.middleware")
const { autorizarPerfis } = require("../middlewares/role.middleware")
const { validar } = require("../middlewares/validate.middleware")
const {
  schemaCriarPagamento,
  schemaHistoricoPagamentos,
  schemaIdPagamento,
  schemaRejeitarPagamento
} = require("../validations/payment.validation")

const paymentRoutes = Router()

paymentRoutes.use(autenticar)

paymentRoutes.post(
  "/",
  autorizarPerfis("REGISTRO", "AUTORIZACAO", "ADMINISTRACAO"),
  validar(schemaCriarPagamento),
  (req, res, next) => paymentController.criar(req, res, next)
)

paymentRoutes.get(
  "/my",
  autorizarPerfis("REGISTRO", "ADMINISTRACAO"),
  (req, res, next) => paymentController.listarMeus(req, res, next)
)

paymentRoutes.get(
  "/pending",
  autorizarPerfis("AUTORIZACAO", "ADMINISTRACAO"),
  (req, res, next) => paymentController.listarPendentes(req, res, next)
)

paymentRoutes.patch(
  "/:id/authorize",
  autorizarPerfis("AUTORIZACAO", "ADMINISTRACAO"),
  validar(schemaIdPagamento, "params"),
  (req, res, next) => paymentController.autorizar(req, res, next)
)

paymentRoutes.patch(
  "/:id/reject",
  autorizarPerfis("AUTORIZACAO", "ADMINISTRACAO"),
  validar(schemaIdPagamento, "params"),
  validar(schemaRejeitarPagamento),
  (req, res, next) => paymentController.rejeitar(req, res, next)
)

paymentRoutes.get(
  "/history",
  autorizarPerfis("ADMINISTRACAO"),
  validar(schemaHistoricoPagamentos, "query"),
  (req, res, next) => paymentController.historico(req, res, next)
)

module.exports = {
  paymentRoutes
}
