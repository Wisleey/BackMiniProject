const { userService } = require("../services/user.service")

class UserController {
  async criar(req, res) {
    const usuario = await userService.criar(req.body)

    return res.status(201).json({
      mensagem: "Usuario criado com sucesso.",
      dados: usuario
    })
  }

  async listar(_req, res) {
    const usuarios = await userService.listar()

    return res.status(200).json({
      dados: usuarios
    })
  }

  async buscarPorId(req, res) {
    const usuario = await userService.buscarPorId(req.params.id, req.usuario)

    return res.status(200).json({
      dados: usuario
    })
  }

  async atualizar(req, res) {
    const usuarioAtualizado = await userService.atualizar(req.params.id, req.body)

    return res.status(200).json({
      mensagem: "Usuario atualizado com sucesso.",
      dados: usuarioAtualizado
    })
  }

  async remover(req, res) {
    const resultado = await userService.remover(req.params.id, req.usuario)

    return res.status(200).json(resultado)
  }
}

module.exports = {
  userController: new UserController()
}
