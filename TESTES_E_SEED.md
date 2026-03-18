# Testes e Seed

## Visao geral

O projeto ja possui seed idempotente em `prisma/seed.js` para criar os tres perfis obrigatorios:

- `ADMINISTRACAO`
- `REGISTRO`
- `AUTORIZACAO`

Os testes automatizados foram configurados com `Jest` + `Supertest` e usam mock do Prisma em memoria. Isso significa que os testes validam autenticacao, RBAC e regras de negocio sem depender do MySQL estar ativo.

## Como rodar o seed

1. Acesse a pasta `backend`.
2. Garanta que o arquivo `.env` exista e esteja configurado.
3. Gere o client do Prisma:

```bash
npm run prisma:generate
```

4. Execute as migracoes no banco configurado:

```bash
npm run prisma:migrate
```

5. Rode o seed:

```bash
npm run prisma:seed
```

### Observacao sobre migracoes

Foi adicionada a migracao `20260316004640_add_notifications`, responsavel pela tabela `notificacoes`.

Se o banco local ainda nao estiver atualizado, rode:

```bash
npx prisma migrate dev
```

## Usuarios criados pelo seed

Se nenhuma variavel personalizada for informada no `.env`, o seed cria ou atualiza estes usuarios:

- `admin` / `Admin@123` / `ADMINISTRACAO`
- `registro` / `Registro@123` / `REGISTRO`
- `autorizacao` / `Autorizacao@123` / `AUTORIZACAO`

As credenciais podem ser sobrescritas pelas variaveis:

- `ADMIN_NOME`, `ADMIN_LOGIN`, `ADMIN_SENHA`
- `REGISTRO_NOME`, `REGISTRO_LOGIN`, `REGISTRO_SENHA`
- `AUTORIZACAO_NOME`, `AUTORIZACAO_LOGIN`, `AUTORIZACAO_SENHA`

## Como rodar os testes

Na pasta `backend`, execute:

```bash
npm test
```

Opcionalmente, para modo observacao:

```bash
npm run test:watch
```

## O que a suite cobre

- Login com JWT
- Protecao de rotas autenticadas
- RBAC por perfil
- Registro de pagamentos
- Rejeicao com motivo obrigatorio, autorizador e data da decisao
- Criacao de notificacao persistida quando um pagamento e rejeitado
- Leitura e marcacao de notificacoes como lidas
- Consulta de historico por periodo
- Gestao de usuarios restrita a `ADMINISTRACAO`

## Rotas validadas por perfil

### `REGISTRO`

- `POST /auth/login`
- `POST /payments`
- `GET /payments/my`
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- bloqueio em `GET /payments/pending`
- bloqueio em `PATCH /payments/:id/authorize`
- bloqueio em `PATCH /payments/:id/reject`
- bloqueio em `GET /payments/history`
- bloqueio em todas as rotas de `users`

### `AUTORIZACAO`

- `POST /auth/login`
- `POST /payments`
- `GET /payments/pending`
- `PATCH /payments/:id/authorize`
- `PATCH /payments/:id/reject`
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- bloqueio em `GET /payments/my`
- bloqueio em `GET /payments/history`
- bloqueio em todas as rotas de `users`

### `ADMINISTRACAO`

- `POST /auth/login`
- `POST /payments`
- `GET /payments/my`
- `GET /payments/pending`
- `GET /payments/history`
- `PATCH /payments/:id/authorize`
- `PATCH /payments/:id/reject`
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`

## Notificacoes em tempo real

O projeto agora possui notificacoes persistidas com entrega em tempo real via SSE:

- persistencia em `notificacoes`
- endpoint SSE em `GET /notifications/stream`
- badge e central de notificacoes no frontend
- toast em tempo real para rejeicoes
- manutencao do destaque em `MeusPagamentos`

## Observacao sobre a rejeicao no frontend

O requisito de notificacao visual para pagamentos rejeitados ja existe no frontend em `frontend/src/pages/pagamentos/MeusPagamentosPage.jsx`.

Quando o pagamento esta com status `REJEITADO`, a interface exibe:

- destaque visual no card
- nome do autorizador
- motivo da rejeicao
- data da decisao
