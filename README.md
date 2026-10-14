# CAOA Venda Cantada Dash

Sistema web para cadastro e acompanhamento de intenções de venda, com frontend em Next.js e backend em Express + Prisma.

## Visão geral

- Frontend em Next.js 15
- Backend em Express + TypeScript
- Banco de dados SQL Server com Prisma
- Autenticação com NextAuth
- Catálogos do formulário carregados via API
- Suporte a Docker para subir a aplicação completa

## Estrutura

- `frontend/` - aplicação web
- `backend/` - API, Prisma, migrations e seed
- `frontend/Dockerfile.web` - build do frontend
- `backend/Dockerfile` - build do backend
- `docker-compose.yml` - ambiente de desenvolvimento com frontend, backend e SQL Server
- `docker-compose.prod.yml` - ambiente de produção com Nginx, frontend e backend

## Principais recursos

- Cadastro, consulta, edição e exclusão de intenções de venda conforme as permissões do usuário
- Carregamento dinâmico de catálogos via banco de dados
- Campos dependentes no formulário, como ano e modelo
- Dashboard de vendas cantadas com visões por dia, mês, ano e intervalo personalizado
- Atalhos para o ano atual e os três anteriores, detalhamento por bandeira e relatórios por marca e vendedor
- Gestão administrativa de usuários, perfis e status
- Autorização por perfis e permissões
- Liberação de telas por usuário, configurável pela Gestão de Acessos
- API documentada com Swagger
- Login corporativo pelo Microsoft Entra ID, com alternativa temporária habilitável somente por variável de ambiente

## Requisitos

- Node.js 20+
- pnpm 11+
- SQL Server 2022+ ou acesso a uma instância SQL Server existente

## Variáveis de ambiente

### Desenvolvimento local

O desenvolvimento usa arquivos separados e ignorados pelo Git. Eles nunca devem
receber credenciais ou URLs de produção.

1. Copie `backend/.env.development.example` para `backend/.env.development`.
2. Copie `frontend/.env.development.example` para `frontend/.env.development`.
3. Defina o mesmo `BACKEND_AUTH_SECRET` nos dois arquivos.
4. Ajuste `DATABASE_URL` para o SQL Server Docker local. O exemplo usa a porta
   `1434`, utilizada pelo banco isolado de desenvolvimento (`salesdb`).

O frontend usa o backend local via `/api/*`, com `API_BASE_URL` apontando para
`http://127.0.0.1:4000`.

> O arquivo `backend/.env` não é a configuração de desenvolvimento. Ele pode
> conter uma conexão corporativa e não deve ser usado por `pnpm dev:backend`,
> `pnpm db:studio`, `pnpm db:seed` ou `pnpm --dir backend rbac:seed`.

### Produção

Na produção, defina `DATABASE_PROVIDER`, `DATABASE_URL`, `BACKEND_AUTH_SECRET`
e as credenciais Microsoft Entra explicitamente no `.env.production` ou no
cofre de segredos usado no deploy. Não copie o arquivo de desenvolvimento para
um servidor de produção.

O backend usa SQL Server por padrão, e a camada Prisma continua preparada para outros providers se você precisar adaptar o ambiente.

O prazo padrão para abrir conexões SQL Server é de 30 segundos, para acomodar conexões por VPN com maior latência. Ajuste `DATABASE_CONNECT_TIMEOUT_SECONDS` se necessário. Sem essa variável, um prazo já definido na `DATABASE_URL` é preservado. Esse limite é separado de `DATABASE_POOL_TIMEOUT_SECONDS`, que controla a espera por uma conexão livre no pool.

Importante: no Prisma, o `provider` do schema precisa continuar alinhado com o banco alvo do deploy e as migrations precisam ser recriadas para o novo dialeto. Ou seja, o app fica agnóstico na configuração e na camada de acesso, mas a troca entre dialetos ainda exige regenerar o client e revisar as migrations.

Se você não estiver usando Docker, ajuste a porta na `DATABASE_URL` do arquivo
`backend/.env.development`. Para o ambiente isolado usado neste projeto, o SQL
Server de desenvolvimento fica em `localhost:1434`.

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

O comando carrega obrigatoriamente `backend/.env.development` e não executa
migrations automaticamente.

### 3. Rodar o frontend

```bash
pnpm dev
```

O frontend sobe em `http://localhost:3000`.

O Next.js carrega `frontend/.env.development` ao executar `next dev`.

## Banco de dados

### Prisma Studio

```bash
pnpm db:studio
```

O Studio aberto por esse comando usa exclusivamente
`backend/.env.development`. Confirme que a conexão é `localhost:1434 / salesdb`
antes de editar dados.

### Seed

Para popular o banco com os dados iniciais:

```bash
pnpm db:seed
```

O seed recria os dados da intenção de venda e os catálogos do formulário.

O comando usa o banco de desenvolvimento e substitui apenas os dados de
exemplo de `SalesIntention`, `SalesIntentionCatalog` e
`SalesIntentionOptionCombination`. Usuários, roles e permissões são preservados.

### Seed de autorização

Para criar ou sincronizar os perfis e permissões locais:

```bash
pnpm --dir backend rbac:seed
```

Esse comando também usa `backend/.env.development`.

## Documentação do projeto

Arquivos de documentação adicionais foram movidos para a pasta `docs/`.

- [Mapa do projeto](./docs/PROJECT_MAP.md)
- [Autenticação Microsoft Entra ID](./docs/LOGIN-MICROSOFT.md)
- [Configuração do Microsoft Entra ID](./docs/AZURE_AD_SETUP.md)
- [Controle de acesso e gestão de usuários](./docs/access-control.md)
- [Funcionalidades entregues](./docs/DOCUMENTACAO_ENTREGAS.md)
- [Configurações de máquina e softwares](./docs/CONFIGURACOES-MAQUINA-E-SOFTWARES.md)
- [Medições de performance](./docs/performance.md)
- [Registro de refatoração](./docs/refactoring.md)

`docs/PERMISSAO_AUTO_LOGIN.md` é a especificação histórica que orientou a
implementação de RBAC. Para o comportamento atual, use `docs/access-control.md`.

## Docker

Para subir tudo com Docker:

```bash
pnpm docker:up
```

Serviços expostos:

- Frontend: `http://localhost:3001`
- Backend: `http://localhost:4001`
- SQL Server: `localhost:1433`

Para parar:

```bash
pnpm docker:down
```

## Produção em VM

Para subir em uma VM com link público:

1. Copie [`.env.production.example`](./.env.production.example) para `.env.production` e preencha os valores reais.
2. Providencie um certificado válido e a respectiva chave em `deploy/certs/fullchain.pem` e `deploy/certs/privkey.pem`. Veja [`deploy/certs/README.md`](./deploy/certs/README.md). Para o IP privado atual, o certificado deve ser emitido pela CA interna; o recomendado é usar um nome DNS interno.
3. Configure `NEXTAUTH_URL` com a URL HTTPS final, por exemplo `https://vendas.caoa.intra`.
4. Na VM, rode:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

5. Acesse o sistema pelo `https://NOME_OU_IP_DA_VM`. A porta 80 redireciona automaticamente para HTTPS.
6. Se precisar popular os dados iniciais, rode:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production exec backend pnpm db:seed
```

O arquivo de produção já inclui:

- Backend com migrations automáticas no boot
- Frontend apontando para o backend interno
- Nginx exposto nas portas `80` e `443`, com redirecionamento obrigatório para HTTPS
- TLS 1.2/1.3 e cabeçalhos de segurança no ponto de entrada
- `DATABASE_URL` configurável para SQL Server externo ou gerenciado

O certificado e sua chave privada ficam fora do Git em `deploy/certs/`.

## Scripts úteis

### Frontend

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`

### Backend

- `pnpm dev:backend`
- `pnpm build:backend`
- `pnpm db:seed`
- `pnpm db:studio`
- `pnpm --dir backend rbac:seed`
- `pnpm --dir backend dev:prisma:push` — aplica o schema somente no banco local configurado em `backend/.env.development`
- `pnpm --dir backend dev:prisma:migrate:deploy` — aplica somente as migrations revisadas no banco local configurado em `backend/.env.development`

Evite executar `prisma db push`, `prisma migrate dev` ou `prisma migrate reset`
sem uma `DATABASE_URL` revisada. Esses comandos nunca devem apontar para
produção sem aprovação explícita.

## API

### Endpoints principais

- `GET /health`
- `GET /sales-intentions` - lista o mês corrente e aceita filtros via querystring
- `GET /sales-intentions/search` - busca registros por querystring
- `GET /sales-intentions/:id`
- `POST /sales-intentions`
- `PUT /sales-intentions/:id`
- `DELETE /sales-intentions/:id`
- `GET /sales-intention-catalogs` - fontes segregadas para o formulário
- `GET /users/me/access` - perfis, escopo e Regionais do usuário autenticado
- `GET /users/access-management` - lista administrativa de usuários
- `DELETE /users/:id` - exclusão administrativa segura de usuário

Exemplo de busca:

```bash
GET /sales-intentions/search?proprietario=hermano&tipoVenda=NOVOS&startDate=2025-06-01&endDate=2025-06-30
```

### Swagger

Depois de subir o backend:

- `http://localhost:4000/docs`
- `http://localhost:4000/openapi.json`

## Observações

## Testes automatizados

A suíte não usa dados de produção e está dividida em:

- **Unitários e componentes:** Vitest, Testing Library e `user-event` no frontend; Vitest no backend.
- **Integração de API:** Supertest exercita os contratos HTTP do Express com serviços mockados, sem exigir SQL Server.
- **E2E:** Playwright/Chromium inicia o Next.js e valida rota protegida e login. O login Microsoft real não é automatizado porque exige credenciais corporativas.

Instale o Chromium uma única vez:

```bash
pnpm --filter caoa-venda-cantada-web exec playwright install chromium
```

```bash
pnpm test:unit
pnpm test:coverage
pnpm test:e2e
pnpm test:e2e:ui
pnpm test:e2e:headed
pnpm test:e2e:debug
pnpm test:e2e:report
pnpm test:all
```

Use `E2E_BASE_URL` somente para um ambiente de homologação controlado. Sem ela, o Playwright usa o servidor local. Relatórios, resultados e cobertura são ignorados pelo Git.

- Em desenvolvimento, o frontend roda por padrão na porta `3000`.
- No `pnpm start`, o frontend roda por padrão na porta `3003`.
- Se aparecer erro de build no Next.js, rode `pnpm build` antes de usar `pnpm start`.
- Se algum campo do formulário não carregar, verifique primeiro se o backend está ativo e se os dados do seed foram aplicados.

## Produção nativa (sem Docker)

### Publicar atras do IIS

Para Windows Server com IIS, use o IIS como terminador HTTPS e proxy reverso para
o Next.js em `127.0.0.1:3003`. O projeto inclui um `web.config` e o procedimento
completo em [`deploy/iis/README.md`](./deploy/iis/README.md).

Para executar os dois serviços diretamente pelo Node.js, inclusive durante o desenvolvimento em configuração de produção:

1. Copie `.env.production.example` para `.env.production` e configure o banco, `NEXTAUTH_URL` e as credenciais de autenticação. Para SQL Server na própria máquina, ajuste `DATABASE_URL` para `localhost:1433`.
2. Confirme que o SQL Server está em execução e que o banco existe.
3. Execute:

```bash
pnpm start
```

O comando carrega `.env.production`, compila backend e frontend, aplica as migrations e sobe a API (`4000`) antes do frontend (`3003`). Use `Ctrl+C` para encerrar ambos.

### Manter ativo no Windows sem abrir o VS Code

Instale a aplicacao no Agendador de Tarefas do Windows e inicie-a em segundo plano:

```powershell
pnpm service:install
```

A tarefa inicia automaticamente a cada logon, sem abrir uma janela, e tenta reiniciar a aplicacao se o processo falhar. O Windows precisa estar ligado e o usuario precisa ter feito logon. Comandos de administracao:

```powershell
pnpm service:status
pnpm service:stop
pnpm service:start
pnpm service:uninstall
```

Os logs ficam em `logs/production.log`. Depois de alterar o codigo, pare e inicie a tarefa para que o build seja refeito.

Quando alterar `backend/prisma/schema.prisma`, gere manualmente o client antes do próximo build:

```bash
pnpm --dir backend prisma:generate
```

Essa inicialização nativa atende HTTP em `http://localhost:3003`. Para HTTPS com certificado confiável, mantenha o Nginx configurado no deploy de produção à frente dela e acesse o nome DNS/IP com certificado válido.

### HTTPS e Azure AD

Para executar nativamente com HTTPS nos dois serviços, defina em `.env.production`:

```bash
TLS_ENABLED=true
TLS_CERT_PATH=../deploy/certs/fullchain.pem
TLS_KEY_PATH=../deploy/certs/privkey.pem
NEXTAUTH_URL=https://SEU_HOST:3003
API_BASE_URL=https://SEU_HOST:4000
```

O certificado deve ser válido para `SEU_HOST` e confiável no navegador. Para o IP privado `10.200.2.25`, use certificado da CA interna com esse IP no SAN; o recomendado é utilizar um nome DNS interno.

No Microsoft Entra ID, cadastre exatamente esta URI de redirecionamento no registro do aplicativo:

```text
https://SEU_HOST:3003/api/auth/callback/azure-ad
```

Depois execute `pnpm start` e acesse a mesma URL configurada em `NEXTAUTH_URL`. Sem um certificado confiável e sem essa URI no Entra ID, o login Microsoft será recusado.

## Licença

Este projeto está sob a licença MIT.
