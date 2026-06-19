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
- `docker-compose.yml` - ambiente de desenvolvimento com frontend, backend e banco
- `docker-compose.prod.yml` - ambiente de produção com Nginx, frontend, backend e banco

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

Na produção, prefira definir `DATABASE_URL` explicitamente no `.env.production` para apontar para o banco real.

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

- Frontend: `http://localhost:3003`
- Backend: `http://localhost:4000`
- Postgres: `localhost:5432`

Para parar:

```bash
pnpm docker:down
```

## Produção em VM

Para subir em uma VM com link público:

1. Copie [`.env.production.example`](./.env.production.example) para `.env.production` e preencha os valores reais.
2. Na VM, rode:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

3. Acesse o sistema pelo `http://IP_DA_VM` ou pelo domínio configurado em `NEXTAUTH_URL`.
4. Se precisar popular os dados iniciais, rode:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend pnpm db:seed
```

O arquivo de produção já inclui:

- Postgres com volume persistente
- Backend com migrations automáticas no boot
- Frontend apontando para o backend interno
- Nginx exposto na porta `80`
- `DATABASE_URL` configurável para banco interno ou banco gerenciado

Se quiser HTTPS, coloque um proxy TLS na frente do Nginx ou troque o serviço por um stack com Certbot/Traefik.

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
