const { ErroAplicacao } = require("../utils/app-error")

function autorizarPerfis(...perfisPermitidos) {
  return (req, _res, next) => {
    if (!req.usuario) {
      return next(new ErroAplicacao("Usuario nao autenticado.", 401))
    }

    if (!perfisPermitidos.includes(req.usuario.role)) {
      return next(new ErroAplicacao("Voce nao tem permissao para acessar este recurso.", 403))
    }

    return next()
  }
}

module.exports = {
  autorizarPerfis
}
