const { Router } = require("express")
const { authController } = require("../controllers/auth.controller")
const { validar } = require("../middlewares/validate.middleware")
const { loginSchema } = require("../validations/auth.validation")

const authRoutes = Router()

authRoutes.post("/login", validar(loginSchema), (req, res, next) =>
  authController.login(req, res, next)
)

module.exports = {
  authRoutes
}
