jest.mock("../src/config/prisma", () => require("./support/mock-prisma"))

const request = require("supertest")
const { app } = require("../src/app")
const { resetMockDatabase } = require("./support/mock-prisma")
const { credenciais, criarEstadoInicial } = require("./support/fixtures")

describe("Autenticacao", () => {
  beforeEach(async () => {
    resetMockDatabase(await criarEstadoInicial())
  })

  it("realiza login com sucesso para usuario valido", async () => {
    const resposta = await request(app).post("/auth/login").send(credenciais.admin)

    expect(resposta.statusCode).toBe(200)
    expect(resposta.body.token).toEqual(expect.any(String))
    expect(resposta.body.usuario).toMatchObject({
      login: credenciais.admin.login,
      role: "ADMINISTRACAO"
    })
  })

  it("bloqueia login com credenciais invalidas", async () => {
    const resposta = await request(app).post("/auth/login").send({
      login: credenciais.admin.login,
      senha: "SenhaInvalida"
    })

    expect(resposta.statusCode).toBe(401)
    expect(resposta.body.mensagem).toBe("Login ou senha invalidos.")
  })

  it("impede acesso a rota protegida sem token", async () => {
    const resposta = await request(app).get("/payments/my")

    expect(resposta.statusCode).toBe(401)
    expect(resposta.body.mensagem).toBe("Token nao informado.")
  })
})
