jest.mock("../src/config/prisma", () => require("./support/mock-prisma"))

const request = require("supertest")
const { app } = require("../src/app")
const { resetMockDatabase } = require("./support/mock-prisma")
const { credenciais, criarEstadoInicial } = require("./support/fixtures")

async function autenticar(credencial) {
  const resposta = await request(app).post("/auth/login").send(credencial)
  return resposta.body.token
}

describe("Usuarios", () => {
  beforeEach(async () => {
    resetMockDatabase(await criarEstadoInicial())
  })

  it("permite que ADMINISTRACAO faca o ciclo de criacao, consulta, atualizacao e remocao", async () => {
    const token = await autenticar(credenciais.admin)

    const criacao = await request(app)
      .post("/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Usuario Operacional",
        login: "operacional",
        senha: "Operacional@123",
        role: "REGISTRO"
      })

    expect(criacao.statusCode).toBe(201)
    const idCriado = criacao.body.dados.id

    const consulta = await request(app)
      .get(`/users/${idCriado}`)
      .set("Authorization", `Bearer ${token}`)

    expect(consulta.statusCode).toBe(200)
    expect(consulta.body.dados.login).toBe("operacional")

    const atualizacao = await request(app)
      .put(`/users/${idCriado}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nome: "Usuario Operacional Atualizado",
        role: "AUTORIZACAO"
      })

    expect(atualizacao.statusCode).toBe(200)
    expect(atualizacao.body.dados).toMatchObject({
      nome: "Usuario Operacional Atualizado",
      role: "AUTORIZACAO"
    })

    const remocao = await request(app)
      .delete(`/users/${idCriado}`)
      .set("Authorization", `Bearer ${token}`)

    expect(remocao.statusCode).toBe(200)
    expect(remocao.body.mensagem).toBe("Usuario removido com sucesso.")
  })

  it("impede que ADMINISTRACAO remova o proprio usuario logado", async () => {
    const token = await autenticar(credenciais.admin)

    const resposta = await request(app)
      .delete("/users/1")
      .set("Authorization", `Bearer ${token}`)

    expect(resposta.statusCode).toBe(400)
    expect(resposta.body.mensagem).toBe("Nao e permitido remover o proprio usuario logado.")
  })

  it.each([
    ["REGISTRO", credenciais.registro, "get", "/users", 403],
    ["REGISTRO", credenciais.registro, "get", "/users/2", 403],
    ["REGISTRO", credenciais.registro, "post", "/users", 403],
    ["REGISTRO", credenciais.registro, "put", "/users/2", 403],
    ["REGISTRO", credenciais.registro, "delete", "/users/2", 403],
    ["AUTORIZACAO", credenciais.autorizacao, "get", "/users", 403],
    ["AUTORIZACAO", credenciais.autorizacao, "get", "/users/3", 403],
    ["AUTORIZACAO", credenciais.autorizacao, "post", "/users", 403],
    ["AUTORIZACAO", credenciais.autorizacao, "put", "/users/3", 403],
    ["AUTORIZACAO", credenciais.autorizacao, "delete", "/users/3", 403]
  ])(
    "bloqueia %s em %s %s",
    async (_perfil, credencial, metodo, rota, statusEsperado) => {
      const token = await autenticar(credencial)

      let requisicao = request(app)[metodo](rota).set("Authorization", `Bearer ${token}`)

      if (metodo === "post") {
        requisicao = requisicao.send({
          nome: "Usuario Teste",
          login: "usuario-teste",
          senha: "Usuario@123",
          role: "REGISTRO"
        })
      }

      if (metodo === "put") {
        requisicao = requisicao.send({
          nome: "Usuario Teste Atualizado"
        })
      }

      const resposta = await requisicao
      expect(resposta.statusCode).toBe(statusEsperado)
    }
  )
})
