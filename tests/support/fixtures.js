const bcrypt = require("bcrypt")

const credenciais = {
  admin: {
    login: "admin",
    senha: "Admin@123"
  },
  registro: {
    login: "registro",
    senha: "Registro@123"
  },
  autorizacao: {
    login: "autorizacao",
    senha: "Autorizacao@123"
  }
}

async function criarUsuariosBase() {
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 10)

  return [
    {
      id: 1,
      nome: "Administrador Inicial",
      login: credenciais.admin.login,
      senhaHash: await bcrypt.hash(credenciais.admin.senha, saltRounds),
      role: "ADMINISTRACAO",
      createdAt: new Date("2026-03-01T08:00:00.000Z"),
      updatedAt: new Date("2026-03-01T08:00:00.000Z")
    },
    {
      id: 2,
      nome: "Usuario Registro",
      login: credenciais.registro.login,
      senhaHash: await bcrypt.hash(credenciais.registro.senha, saltRounds),
      role: "REGISTRO",
      createdAt: new Date("2026-03-02T08:00:00.000Z"),
      updatedAt: new Date("2026-03-02T08:00:00.000Z")
    },
    {
      id: 3,
      nome: "Usuario Autorizacao",
      login: credenciais.autorizacao.login,
      senhaHash: await bcrypt.hash(credenciais.autorizacao.senha, saltRounds),
      role: "AUTORIZACAO",
      createdAt: new Date("2026-03-03T08:00:00.000Z"),
      updatedAt: new Date("2026-03-03T08:00:00.000Z")
    }
  ]
}

async function criarEstadoInicial() {
  const users = await criarUsuariosBase()

  return {
    users,
    notifications: [],
    payments: [
      {
        id: 1,
        cnpjFavorecido: "11222333000181",
        razaoSocial: "Fornecedor Pendente LTDA",
        valor: 1500.5,
        descricaoServico: "Servico de manutencao preventiva",
        dataRegistro: new Date("2026-03-10T10:00:00.000Z"),
        status: "PENDENTE",
        solicitanteId: 2,
        autorizadorId: null,
        dataDecisao: null,
        motivoRejeicao: null,
        createdAt: new Date("2026-03-10T10:00:00.000Z"),
        updatedAt: new Date("2026-03-10T10:00:00.000Z")
      },
      {
        id: 2,
        cnpjFavorecido: "22333444000181",
        razaoSocial: "Fornecedor Rejeitado SA",
        valor: 2300,
        descricaoServico: "Consultoria especializada",
        dataRegistro: new Date("2026-03-11T09:00:00.000Z"),
        status: "REJEITADO",
        solicitanteId: 2,
        autorizadorId: 3,
        dataDecisao: new Date("2026-03-12T14:30:00.000Z"),
        motivoRejeicao: "Documento fiscal inconsistente",
        createdAt: new Date("2026-03-11T09:00:00.000Z"),
        updatedAt: new Date("2026-03-12T14:30:00.000Z")
      },
      {
        id: 3,
        cnpjFavorecido: "33444555000181",
        razaoSocial: "Fornecedor Autorizado ME",
        valor: 980.75,
        descricaoServico: "Licenciamento mensal",
        dataRegistro: new Date("2026-03-15T16:45:00.000Z"),
        status: "AUTORIZADO",
        solicitanteId: 1,
        autorizadorId: 1,
        dataDecisao: new Date("2026-03-15T18:00:00.000Z"),
        motivoRejeicao: null,
        createdAt: new Date("2026-03-15T16:45:00.000Z"),
        updatedAt: new Date("2026-03-15T18:00:00.000Z")
      }
    ]
  }
}

module.exports = {
  credenciais,
  criarEstadoInicial
}
