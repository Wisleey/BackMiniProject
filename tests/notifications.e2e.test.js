jest.mock("../src/config/prisma", () => require("./support/mock-prisma"))

const request = require("supertest")
const { app } = require("../src/app")
const { resetMockDatabase } = require("./support/mock-prisma")
const { credenciais, criarEstadoInicial } = require("./support/fixtures")

async function autenticar(credencial) {
  const resposta = await request(app).post("/auth/login").send(credencial)
  return resposta.body.token
}

describe("Notificacoes", () => {
  beforeEach(async () => {
    resetMockDatabase(await criarEstadoInicial())
  })

  it("lista notificacoes do usuario autenticado com total de nao lidas", async () => {
    const tokenAutorizacao = await autenticar(credenciais.autorizacao)

    await request(app)
      .patch("/payments/1/reject")
      .set("Authorization", `Bearer ${tokenAutorizacao}`)
      .send({
        motivoRejeicao: "Reprovado por falta de comprovante"
      })

    const tokenRegistro = await autenticar(credenciais.registro)
    const resposta = await request(app)
      .get("/notifications")
      .set("Authorization", `Bearer ${tokenRegistro}`)

    expect(resposta.statusCode).toBe(200)
    expect(resposta.body.meta.naoLidas).toBe(1)
    expect(resposta.body.dados[0]).toMatchObject({
      tipo: "PAGAMENTO_REJEITADO",
      payload: {
        autorizadorNome: "Usuario Autorizacao",
        motivoRejeicao: "Reprovado por falta de comprovante"
      }
    })
  })

  it("permite marcar notificacao como lida", async () => {
    const tokenAutorizacao = await autenticar(credenciais.autorizacao)

    await request(app)
      .patch("/payments/1/reject")
      .set("Authorization", `Bearer ${tokenAutorizacao}`)
      .send({
        motivoRejeicao: "Motivo para leitura individual"
      })

    const tokenRegistro = await autenticar(credenciais.registro)
    const listagem = await request(app)
      .get("/notifications")
      .set("Authorization", `Bearer ${tokenRegistro}`)

    const notificacaoId = listagem.body.dados[0].id

    const resposta = await request(app)
      .patch(`/notifications/${notificacaoId}/read`)
      .set("Authorization", `Bearer ${tokenRegistro}`)

    expect(resposta.statusCode).toBe(200)
    expect(resposta.body.dados.lidaEm).toEqual(expect.any(String))
  })

  it("permite marcar todas as notificacoes como lidas", async () => {
    const tokenAutorizacao = await autenticar(credenciais.autorizacao)
    const tokenRegistro = await autenticar(credenciais.registro)

    await request(app)
      .patch("/payments/1/reject")
      .set("Authorization", `Bearer ${tokenAutorizacao}`)
      .send({
        motivoRejeicao: "Primeira notificacao"
      })

    await request(app)
      .post("/payments")
      .set("Authorization", `Bearer ${tokenRegistro}`)
      .send({
        cnpjFavorecido: "11222333000181",
        razaoSocial: "Fornecedor Novo",
        valor: 100,
        descricaoServico: "Servico teste"
      })

    await request(app)
      .patch("/payments/4/reject")
      .set("Authorization", `Bearer ${tokenAutorizacao}`)
      .send({
        motivoRejeicao: "Segunda notificacao"
      })

    const resposta = await request(app)
      .patch("/notifications/read-all")
      .set("Authorization", `Bearer ${tokenRegistro}`)

    expect(resposta.statusCode).toBe(200)
    expect(resposta.body.meta.naoLidas).toBe(0)
  })
})
