const jwt = require("jsonwebtoken")
const { env } = require("../config/env")

function gerarToken(usuario) {
  return jwt.sign(
    {
      role: usuario.role,
      login: usuario.login
    },
    env.JWT_SECRET,
    {
      subject: String(usuario.id),
      expiresIn: env.JWT_EXPIRES_IN
    }
  )
}

module.exports = {
  gerarToken
}
