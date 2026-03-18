const { notificationService } = require("../services/notification.service")
const { notificationStreamService } = require("../services/notification-stream.service")

class NotificationController {
  async listar(req, res) {
    const resultado = await notificationService.listar(req.usuario, req.query)

    return res.status(200).json({
      dados: resultado.notificacoes,
      meta: resultado.meta
    })
  }

  async marcarComoLida(req, res) {
    const notificacao = await notificationService.marcarComoLida(req.params.id, req.usuario)

    return res.status(200).json({
      mensagem: "Notificacao marcada como lida.",
      dados: notificacao
    })
  }

  async marcarTodasComoLidas(req, res) {
    const resultado = await notificationService.marcarTodasComoLidas(req.usuario)

    return res.status(200).json(resultado)
  }

  async stream(req, res) {
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache, no-transform")
    res.setHeader("Connection", "keep-alive")
    res.setHeader("X-Accel-Buffering", "no")
    res.flushHeaders?.()

    notificationStreamService.adicionarConexao(req.usuario.id, res)
    notificationStreamService.enviarEvento(req.usuario.id, "connected", {
      usuarioId: req.usuario.id
    })

    const intervaloHeartbeat = setInterval(() => {
      res.write(": heartbeat\n\n")
    }, 30000)

    req.on("close", () => {
      clearInterval(intervaloHeartbeat)
      notificationStreamService.removerConexao(req.usuario.id, res)
      res.end()
    })
  }
}

module.exports = {
  notificationController: new NotificationController()
}
