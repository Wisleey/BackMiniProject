jest.mock("../src/config/prisma", () => require("./support/mock-prisma"))

const request = require("supertest")
const { app } = require("../src/app")
const { getMockDatabase, resetMockDatabase } = require("./support/mock-prisma")
const { credenciais, criarEstadoInicial } = require("./support/fixtures")

async function autenticar(credencial) {
  const resposta = await request(app).post("/auth/login").send(credencial)
  return resposta.body.token
}

describe("Pagamentos", () => {
  beforeEach(async () => {
    resetMockDatabase(await criarEstadoInicial())
  })

  it("permite registrar pagamento para todos os perfis autenticados", async () => {
    const casos = [
      ["REGISTRO", credenciais.registro],
      ["AUTORIZACAO", credenciais.autorizacao],
      ["ADMINISTRACAO", credenciais.admin]
    ]

    for (const [, credencial] of casos) {
      const token = await autenticar(credencial)

      const resposta = await request(app)
        .post("/payments")
        .set("Authorization", `Bearer ${token}`)
        .send({
          cnpjFavorecido: "11222333000181",
          razaoSocial: `Fornecedor ${credencial.login}`,
          valor: 3200.9,
          descricaoServico: "Servico recorrente"
        })

      expect(resposta.statusCode).toBe(201)
      expect(resposta.body.dados).toMatchObject({
        solicitante: {
          login: credencial.login
        },
        status: "PENDENTE",
        autorizador: null,
        motivoRejeicao: null
      })
    }
  })

  it("permite que REGISTRO visualize apenas os proprios registros, incluindo dados da rejeicao", async () => {
    const token = await autenticar(credenciais.registro)

    const resposta = await request(app)
      .get("/payments/my")
      .set("Authorization", `Bearer ${token}`)

    expect(resposta.statusCode).toBe(200)
    expect(resposta.body.dados).toHaveLength(2)
    expect(resposta.body.dados.every((item) => item.solicitante.login === credenciais.registro.login)).toBe(
      true
    )

    const rejeitado = resposta.body.dados.find((item) => item.status === "REJEITADO")
    expect(rejeitado).toMatchObject({
      motivoRejeicao: "Documento fiscal inconsistente",
      autorizador: {
        nome: "Usuario Autorizacao"
      }
    })
  })

  it("permite que AUTORIZACAO rejeite pagamento pendente salvando motivo, autorizador, data da decisao e notificacao", async () => {
    const token = await autenticar(credenciais.autorizacao)

    const resposta = await request(app)
      .patch("/payments/1/reject")
      .set("Authorization", `Bearer ${token}`)
      .send({
        motivoRejeicao: "Dados bancarios divergentes"
      })

    expect(resposta.statusCode).toBe(200)
    expect(resposta.body.dados).toMatchObject({
      id: 1,
      status: "REJEITADO",
      motivoRejeicao: "Dados bancarios divergentes",
      autorizador: {
        login: credenciais.autorizacao.login
      }
    })
    expect(resposta.body.dados.dataDecisao).toEqual(expect.any(String))

    const bancoMock = getMockDatabase()
    expect(bancoMock.notifications).toHaveLength(1)
    expect(bancoMock.notifications[0]).toMatchObject({
      usuarioId: 2,
      tipo: "PAGAMENTO_REJEITADO",
      payload: {
        pagamentoId: 1,
        autorizadorNome: "Usuario Autorizacao",
        motivoRejeicao: "Dados bancarios divergentes"
      }
    })
  })

  it("permite que ADMINISTRACAO consulte historico por periodo com ordenacao do mais recente para o mais antigo", async () => {
    const token = await autenticar(credenciais.admin)

    const resposta = await request(app)
      .get("/payments/history")
      .set("Authorization", `Bearer ${token}`)
      .query({
        dataInicio: "2026-03-11",
        dataFim: "2026-03-15"
      })

    expect(resposta.statusCode).toBe(200)
    expect(resposta.body.dados.map((item) => item.id)).toEqual([3, 2])
  })

  it("valida que a data fim nao pode ser menor que a data inicio", async () => {
    const token = await autenticar(credenciais.admin)

    const resposta = await request(app)
      .get("/payments/history")
      .set("Authorization", `Bearer ${token}`)
      .query({
        dataInicio: "2026-03-15",
        dataFim: "2026-03-11"
      })

    expect(resposta.statusCode).toBe(400)
    expect(resposta.body.erros).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          campo: "dataFim"
        })
      ])
    )
  })

  it.each([
    ["REGISTRO", credenciais.registro, "get", "/payments/pending", 403],
    ["REGISTRO", credenciais.registro, "get", "/payments/history", 403],
    ["REGISTRO", credenciais.registro, "patch", "/payments/1/authorize", 403],
    ["REGISTRO", credenciais.registro, "patch", "/payments/1/reject", 403],
    ["AUTORIZACAO", credenciais.autorizacao, "get", "/payments/my", 403],
    ["AUTORIZACAO", credenciais.autorizacao, "get", "/payments/history", 403],
    ["ADMINISTRACAO", credenciais.admin, "get", "/payments/pending", 200],
    ["ADMINISTRACAO", credenciais.admin, "get", "/payments/my", 200]
  ])(
    "aplica RBAC corretamente para %s em %s %s",
    async (_perfil, credencial, metodo, rota, statusEsperado) => {
      const token = await autenticar(credencial)

      let requisicao = request(app)[metodo](rota).set("Authorization", `Bearer ${token}`)

      if (rota.endsWith("/reject")) {
        requisicao = requisicao.send({ motivoRejeicao: "Motivo de teste" })
      }

      const resposta = await requisicao
      expect(resposta.statusCode).toBe(statusEsperado)
    }
  )
})
