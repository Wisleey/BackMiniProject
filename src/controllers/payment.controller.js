const { paymentService } = require("../services/payment.service")

class PaymentController {
  async criar(req, res) {
    const pagamento = await paymentService.criar(req.body, req.usuario)

    return res.status(201).json({
      mensagem: "Pagamento registrado com sucesso.",
      dados: pagamento
    })
  }

  async listarMeus(req, res) {
    const pagamentos = await paymentService.listarMeusPagamentos(req.usuario)

    return res.status(200).json({
      dados: pagamentos
    })
  }

  async listarPendentes(_req, res) {
    const pagamentos = await paymentService.listarPendentes()

    return res.status(200).json({
      dados: pagamentos
    })
  }

  async autorizar(req, res) {
    const pagamento = await paymentService.autorizar(req.params.id, req.usuario)

    return res.status(200).json({
      mensagem: "Pagamento autorizado com sucesso.",
      dados: pagamento
    })
  }

  async rejeitar(req, res) {
    const pagamento = await paymentService.rejeitar(req.params.id, req.body, req.usuario)

    return res.status(200).json({
      mensagem: "Pagamento rejeitado com sucesso.",
      dados: pagamento
    })
  }

  async historico(req, res) {
    const pagamentos = await paymentService.historico(req.query, req.usuario)

    return res.status(200).json({
      dados: pagamentos
    })
  }
}

module.exports = {
  paymentController: new PaymentController()
}
