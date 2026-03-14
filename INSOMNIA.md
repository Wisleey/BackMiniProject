# Guia de uso no Insomnia

Este arquivo traz um modelo pratico para montar a colecao da API no Insomnia.

## 1. Configuracao de ambiente

Crie um ambiente no Insomnia com as variaveis abaixo:

```json
{
  "base_url": "http://localhost:3333",
  "token": ""
}
```

## 2. Estrutura sugerida da colecao

- `Auth`
- `Usuarios`
- `Pagamentos`

## 3. Requisicoes

### Auth

#### `POST {{ _.base_url }}/auth/login`

Headers:

```json
{
  "Content-Type": "application/json"
}
```

Body:

```json
{
  "login": "admin",
  "senha": "Admin@123"
}
```

Resposta esperada:

```json
{
  "mensagem": "Login realizado com sucesso.",
  "token": "jwt_aqui",
  "usuario": {
    "id": 1,
    "nome": "Administrador Inicial",
    "login": "admin",
    "role": "ADMINISTRACAO",
    "createdAt": "2026-03-14T00:00:00.000Z",
    "updatedAt": "2026-03-14T00:00:00.000Z"
  }
}
```

Depois do login, salve o valor do token manualmente na variavel `token` do ambiente.

### Usuarios

Todas as rotas abaixo exigem header:

```json
{
  "Authorization": "Bearer {{ _.token }}"
}
```

#### `POST {{ _.base_url }}/users`

Body:

```json
{
  "nome": "Novo Administrador",
  "login": "admin2",
  "senha": "Admin@123",
  "role": "ADMINISTRACAO"
}
```

#### `GET {{ _.base_url }}/users`

Sem body.

#### `GET {{ _.base_url }}/users/1`

Sem body.

#### `PUT {{ _.base_url }}/users/2`

Body:

```json
{
  "nome": "Usuario Registro Atualizado",
  "login": "registro.atualizado",
  "senha": "NovaSenha@123",
  "role": "REGISTRO"
}
```

#### `DELETE {{ _.base_url }}/users/3`

Sem body.

### Pagamentos

Todas as rotas abaixo exigem header:

```json
{
  "Authorization": "Bearer {{ _.token }}",
  "Content-Type": "application/json"
}
```

#### `POST {{ _.base_url }}/payments`

Body:

```json
{
  "cnpjFavorecido": "04252011000110",
  "razaoSocial": "Fornecedor Exemplo LTDA",
  "valor": 1500.75,
  "descricaoServico": "Servico de manutencao predial"
}
```

#### `GET {{ _.base_url }}/payments/my`

Sem body.

#### `GET {{ _.base_url }}/payments/pending`

Sem body.

#### `PATCH {{ _.base_url }}/payments/1/authorize`

Sem body.

#### `PATCH {{ _.base_url }}/payments/1/reject`

Body:

```json
{
  "motivoRejeicao": "Documento fiscal divergente."
}
```

#### `GET {{ _.base_url }}/payments/history`

Consulta sem filtros:

`{{ _.base_url }}/payments/history`

Consulta com filtros:

`{{ _.base_url }}/payments/history?dataInicio=2026-03-01&dataFim=2026-03-31&status=PENDENTE`

Consulta com filtro por solicitante:

`{{ _.base_url }}/payments/history?solicitanteId=2`

## 4. Fluxo rapido de teste

1. Fazer login com `admin`.
2. Criar ou validar usuarios de teste.
3. Fazer login com `registro`.
4. Criar um pagamento.
5. Fazer login com `autorizacao`.
6. Consultar `GET /payments/pending`.
7. Autorizar ou rejeitar um pagamento.
8. Fazer login novamente com `registro` e consultar `GET /payments/my` ou `GET /payments/history`.

## 5. Usuarios iniciais do seed

- `admin / Admin@123`
- `registro / Registro@123`
- `autorizacao / Autorizacao@123`
