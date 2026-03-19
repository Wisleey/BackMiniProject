# Sistema Interno de Pagamentos a Fornecedores

## Descrição

Aplicação interna para registro, acompanhamento, autorização e consulta de pagamentos a fornecedores, com autenticação JWT, controle de acesso por perfil (RBAC), rastreabilidade operacional e notificações em tempo real para rejeições.

O projeto foi estruturado em duas aplicações separadas:

- `backend/`: API REST em Node.js com Express, Prisma e MySQL
- `frontend/`: interface web em React com Vite

## Objetivo da aplicação

O sistema foi desenvolvido para centralizar o fluxo interno de solicitações de pagamento a fornecedores, reduzindo controles informais e aumentando:

- governança sobre o processo de aprovação
- rastreabilidade das decisões
- segregação de responsabilidades por perfil
- visibilidade sobre pagamentos pendentes, autorizados e rejeitados
- segurança no acesso a operações sensíveis

## Funcionalidades principais

- login autenticado com JWT
- registro de pagamentos
- listagem de pagamentos próprios
- autorização de pagamentos pendentes
- rejeição com motivo obrigatório
- consulta de histórico por período
- cadastro e gestão de usuários
- notificações persistidas e em tempo real para rejeições

## Stack utilizada

### Backend

- Node.js
- Express
- Prisma ORM
- MySQL
- JWT (`jsonwebtoken`)
- `bcrypt` para hash de senha
- `zod` para validação de entrada
- `cors`
- `dotenv`
- `nodemon` para desenvolvimento
- `jest` e `supertest` para testes automatizados

### Frontend

- React
- JavaScript
- Vite
- React Router
- Axios
- React Hook Form
- Zod
- Tailwind CSS
- `class-variance-authority`, `clsx` e `tailwind-merge`
- `lucide-react`
- `react-number-format`
- `date-fns`
- `sileo` para toasts
- `@microsoft/fetch-event-source` para SSE autenticado
- `react bits` para efeitos texto tela login

## Estrutura de pastas

### Visão geral

```text
Mini Project BIT/
|-- backend/
|   |-- prisma/
|   |   |-- migrations/
|   |   |-- schema.prisma
|   |   `-- seed.js
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- validations/
|   |-- tests/
|   |-- .env.example
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- contexts/
|   |   |-- hooks/
|   |   |-- layouts/
|   |   |-- pages/
|   |   |-- routes/
|   |   |-- utils/
|   |   `-- validations/
|   |-- .env.example
|   `-- package.json
`-- README.md
```

### Backend

- `src/config/`: carregamento de ambiente e Prisma Client
- `src/controllers/`: camada HTTP
- `src/middlewares/`: autenticação, autorização, validação e tratamento de erros
- `src/routes/`: definição das rotas da API
- `src/services/`: regras de negócio
- `src/utils/`: helpers de JWT, CNPJ, erros e sanitização
- `src/validations/`: schemas Zod
- `prisma/schema.prisma`: modelagem do banco
- `prisma/seed.js`: seed dos usuários iniciais
- `tests/`: suíte automatizada do backend

### Frontend

- `src/api/`: clientes e chamadas HTTP
- `src/components/`: componentes reutilizáveis
- `src/contexts/`: providers de autenticação e notificações
- `src/hooks/`: hooks customizados
- `src/layouts/`: layout principal autenticado
- `src/pages/`: páginas da aplicação
- `src/routes/`: proteção e definição de rotas
- `src/utils/`: formatadores, toasts e armazenamento local
- `src/validations/`: validações de formulários

## Requisitos para rodar localmente

- Node.js 20 ou superior
- npm 10 ou superior
- MySQL 8 ou superior
- um banco MySQL local acessível pela string `DATABASE_URL`

## Instalação de dependências

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

## Configuração de variáveis de ambiente

### Backend

1. Copie o arquivo de exemplo:

```bash
cd backend
copy .env.example .env
```

No PowerShell, se preferir:

```powershell
Copy-Item .env.example .env
```

2. Ajuste as variáveis conforme seu ambiente local.

Variáveis principais:

- `PORT`: porta da API
- `DATABASE_URL`: conexão MySQL no formato do Prisma
- `JWT_SECRET`: segredo do token JWT
- `JWT_EXPIRES_IN`: tempo de expiração do token
- `BCRYPT_SALT_ROUNDS`: custo do hash da senha
- `ADMIN_*`, `REGISTRO_*`, `AUTORIZACAO_*`: usuários iniciais do seed

### Frontend

1. Copie o arquivo de exemplo:

```bash
cd frontend
copy .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

2. Ajuste a URL da API se necessário.

Variável principal:

- `VITE_API_URL`: URL base do backend

## Configuração do MySQL

Crie um banco local, por exemplo:

```sql
CREATE DATABASE pagamentos_fornecedores
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Exemplo de `DATABASE_URL`:

```env
DATABASE_URL="mysql://root:senha@localhost:3306/pagamentos_fornecedores"
```

Se utilizar outro usuário, senha, host ou porta, ajuste a URL de acordo com o seu ambiente.

## Migrations

Com o banco criado e o `.env` configurado:

```bash
cd backend
npm run prisma:migrate
```

Esse comando aplica as migrations e atualiza o schema no banco.

## Seed

Para criar ou atualizar os usuários iniciais:

```bash
cd backend
npm run prisma:seed
```

O seed é idempotente para os logins padrão configurados no `.env`.

## Como iniciar o backend

```bash
cd backend
npm run dev
```

API padrão:

- `http://localhost:3333`

Endpoint de health check:

- `GET /health`

## Como iniciar o frontend

```bash
cd frontend
npm run dev
```

Frontend padrão:

- `http://localhost:5173`

## Credenciais de teste

As credenciais abaixo são geradas pelo seed padrão, desde que você mantenha os valores de exemplo no `.env` do backend.

### ADMINISTRACAO

- login: `admin`
- senha: `Admin@123`

### REGISTRO

- login: `registro`
- senha: `Registro@123`

### AUTORIZACAO

- login: `autorização`
- senha: `Autorização@123`

## Descrição dos perfis de acesso

### REGISTRO

- pode registrar pagamentos
- acessa a tela de `Meus registros`
- visualiza apenas os pagamentos vinculados ao próprio usuário
- recebe notificação quando um pagamento seu for rejeitado

### AUTORIZACAO

- pode registrar pagamentos
- acessa a tela de autorização
- pode autorizar pagamentos pendentes
- pode rejeitar pagamentos pendentes com motivo obrigatório
- recebe notificação quando um pagamento seu for rejeitado

### ADMINISTRACAO

- possui acesso administrativo completo
- pode registrar pagamentos
- pode autorizar e rejeitar pagamentos
- pode consultar histórico por período
- pode criar, editar, listar e remover usuários
- pode acessar notificações do próprio usuário
- recebe notificação quando um pagamento seu for rejeitado

## Principais regras de negócio

- somente usuários autenticados acessam o sistema
- senha é armazenada com hash usando `bcrypt`
- validações existem no backend e no frontend
- todos os campos do pagamento são obrigatórios
- o status inicial do pagamento é sempre `PENDENTE`
- `dataRegistro` e `solicitante` são definidos pelo backend
- rejeição exige `motivoRejeicao`
- ao rejeitar, o sistema salva:
  - autorizador
  - data da decisão
  - motivo da rejeição
- usuário `REGISTRO` enxerga apenas os próprios pagamentos
- histórico por período valida que `dataFim >= dataInicio`
- notificações de rejeição são persistidas e também enviadas em tempo real

## Notificações em tempo real

O projeto utiliza notificações persistidas + SSE para o fluxo de rejeição:

- tabela `notificacoes` para rastreabilidade
- endpoint `GET /notifications/stream` para eventos em tempo real
- listagem em `GET /notifications`
- marcação individual em `PATCH /notifications/:id/read`
- marcação em lote em `PATCH /notifications/read-all`

No frontend:

- badge de notificações
- central de notificações
- toast em tempo real quando uma rejeição é recebida
- destaque visual na tela de `Meus registros`

## Observações de segurança

- nunca utilize um `JWT_SECRET` fraco em ambientes reais
- não versione arquivos `.env` com credenciais reais
- mantenha o MySQL protegido por usuário e senha fortes
- não reutilize as credenciais padrão do seed em homologação ou produção
- o backend valida autenticação e autorização independentemente do frontend
- as senhas não são armazenadas em texto puro
- as operações sensíveis usam segregação por perfil

## Decisões técnicas importantes

### 1. Prisma como camada de acesso a dados

Foi adotado Prisma para:

- reduzir código repetitivo de acesso ao banco
- manter schema tipado e organizado
- facilitar migrations e seed
- melhorar manutenção do projeto

### 2. Validação com Zod

Zod foi utilizado no backend e no frontend para:

- padronizar regras de validação
- reduzir inconsistências de payload
- melhorar mensagens de erro

### 3. JWT stateless

JWT foi escolhido para:

- manter a autenticação simples
- evitar sessão de servidor tradicional
- facilitar integração SPA + API

### 4. SSE para notificações

Foi adotado Server-Sent Events em vez de WebSocket porque o caso de uso é predominantemente unidirecional:

- backend envia eventos
- frontend consome eventos
- menor complexidade operacional do que WebSocket

### 5. Responsividade mobile first

O frontend foi ajustado com foco em:

- cards e formulários adaptados para telas pequenas
- tabelas convertidas para cards em cenários críticos no mobile
- central de notificações em tela cheia no mobile e dropdown no desktop

## Divergências técnicas em relação ao enunciado

### Uso de Prisma

O enunciado exige Node.js, React e MySQL, mas não restringe o uso de ORM.  
Foi utilizado Prisma como decisão técnica para melhorar produtividade, legibilidade e segurança de acesso a dados.

### Notificação de rejeição

O enunciado permitia notificar por alerta na tela inicial ou destaque em tabela.  
Foi implementada uma abordagem mais robusta:

- notificação persistida em banco
- entrega em tempo real via SSE
- central de notificações
- destaque na tela de `Meus registros`

Essa escolha amplia a rastreabilidade e melhora a experiência do usuário sem contrariar o requisito funcional.

### Consulta de histórico

A consulta de histórico foi exposta para `ADMINISTRACAO`, em linha com a necessidade de governança e visibilidade consolidada do processo.  
Usuários de `REGISTRO` continuam restritos aos próprios registros, conforme regra de segregação.

## Fluxo recomendado para subir localmente

1. Criar o banco no MySQL
2. Configurar `backend/.env`
3. Configurar `frontend/.env`
4. Instalar dependências do backend
5. Instalar dependências do frontend
6. Rodar migrations no backend
7. Rodar seed no backend
8. Iniciar o backend
9. Iniciar o frontend
10. Acessar a aplicação e autenticar com uma das credenciais de teste

## Comandos resumidos

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

## Status atual

O projeto está preparado para uso local com:

- autenticação JWT
- RBAC
- gestão de usuários
- fluxo de pagamento
- histórico
- notificações em tempo real
- seed de usuários iniciais
- documentação base para onboarding técnico
