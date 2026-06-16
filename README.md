# CAOA Venda Cantada Dash

Sistema web para cadastro e acompanhamento de intenções de venda, com frontend em Next.js e backend em Express + Prisma.

## Visão geral

- Frontend em Next.js 15
- Backend em Express + TypeScript
- Banco de dados PostgreSQL com Prisma
- Autenticação com NextAuth
- Catálogos do formulário carregados via API
- Suporte a Docker para subir a aplicação completa

## Estrutura

- `src/` - aplicação web
- `backend/` - API, Prisma, migrations e seed
- `Dockerfile.web` - build do frontend
- `backend/Dockerfile` - build do backend
- `docker-compose.yml` - ambiente com frontend, backend e banco

## Principais recursos

- Formulário de intenção de venda
- Carregamento dinâmico de catálogos via banco de dados
- Campos dependentes no formulário, como ano e modelo
- Persistência das intenções no banco
- API documentada com Swagger
- Perfis e autenticação em evolução no projeto

## Requisitos

- Node.js 20+
- pnpm 11+
- PostgreSQL 15+

## Variáveis de ambiente

### Frontend

O frontend usa a API do backend via `/api/*`.

### Backend

Crie `backend/.env` com base no exemplo do projeto:

```bash
DATABASE_URL="postgresql://app:change_me@localhost:5432/salesdb?schema=public"
PORT=4000
```

## Como rodar localmente

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Rodar o backend

Em outro terminal:

```bash
pnpm dev:backend
```

O backend sobe em `http://localhost:4000`.

### 3. Rodar o frontend

```bash
pnpm dev:web
```

O frontend sobe em `http://localhost:3003`.

## Banco de dados

### Prisma Studio

```bash
pnpm --dir backend db:studio
```

### Seed

Para popular o banco com os dados iniciais:

```bash
pnpm --dir backend db:seed
```

O seed recria os dados da intenção de venda e os catálogos do formulário.

## Docker

Para subir tudo com Docker:

```bash
pnpm docker:up
```

Serviços expostos:

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:4001`
- Postgres: `localhost:5432`

Para parar:

```bash
pnpm docker:down
```

## Scripts úteis

### Frontend

- `pnpm dev`
- `pnpm dev:web`
- `pnpm build`
- `pnpm start`
- `pnpm lint`

### Backend

- `pnpm dev:backend`
- `pnpm --dir backend build`
- `pnpm --dir backend db:seed`
- `pnpm --dir backend db:studio`

## API

### Endpoints principais

- `GET /health`
- `GET /sales-intentions`
- `GET /sales-intentions/:id`
- `POST /sales-intentions`
- `PUT /sales-intentions/:id`
- `DELETE /sales-intentions/:id`
- `GET /sales-intention-catalogs`

### Swagger

Depois de subir o backend:

- `http://localhost:4000/docs`
- `http://localhost:4000/openapi.json`

## Observações

- O frontend roda por padrão na porta `3003`.
- Se aparecer erro de build no Next.js, rode `pnpm build` antes de usar `pnpm start`.
- Se algum campo do formulário não carregar, verifique primeiro se o backend está ativo e se os dados do seed foram aplicados.

## Licença

Este projeto está sob a licença MIT.
