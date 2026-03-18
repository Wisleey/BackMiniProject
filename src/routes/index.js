const { Router } = require("express")
const { authRoutes } = require("./auth.routes")
const { userRoutes } = require("./user.routes")
const { paymentRoutes } = require("./payment.routes")
const { notificationRoutes } = require("./notification.routes")

const router = Router()

router.get("/health", (_req, res) => {
  return res.status(200).json({
    mensagem: "API funcionando com sucesso."
  })
})

router.use("/auth", authRoutes)
router.use("/users", userRoutes)
router.use("/payments", paymentRoutes)
router.use("/notifications", notificationRoutes)

module.exports = {
  router
}
