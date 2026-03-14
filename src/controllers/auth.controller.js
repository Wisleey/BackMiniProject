const { authService } = require("../services/auth.service")

class AuthController {
  async login(req, res) {
    const resultado = await authService.login(req.body)

    return res.status(200).json({
      mensagem: "Login realizado com sucesso.",
      ...resultado
    })
  }
}

module.exports = {
  authController: new AuthController()
}
