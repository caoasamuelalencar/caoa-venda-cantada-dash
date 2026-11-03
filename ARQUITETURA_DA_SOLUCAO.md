# 2. Arquitetura da Solução

[[_TOC_]]

---

## 2.1. Objetivo do documento

Este documento descreve a arquitetura técnica do CAOA Venda Cantada Dash, os componentes implementados, as integrações, a estratégia atual de execução e a arquitetura de hospedagem Azure proposta.

Objetivos deste documento:

- estabelecer uma referência para desenvolvimento, manutenção e sustentação;
- mapear componentes, integrações e dependências;
- documentar autenticação, autorização e persistência;
- registrar execução, qualidade e entrega contínua;
- orientar a implantação no Azure;
- registrar decisões, riscos e validações necessárias antes da produção.

> **Escopo:** arquitetura de aplicação e hospedagem. Custos não fazem parte desta versão.

---

## 2.2. Visão geral da solução

O CAOA Venda Cantada Dash é um monorepositório `pnpm` com dois serviços principais:

- um frontend em Next.js 15, React 19 e TypeScript;
- uma API em Express e TypeScript.

O frontend fornece a interface ao usuário, realiza a autenticação corporativa com Microsoft Entra ID e contém o BFF. O backend centraliza as regras de negócio, validações, permissões e persistência. O SQL Server armazena os dados operacionais, catálogos e dados de autorização.

::: mermaid
graph LR;
    U[Usuario] --> FE[Frontend Next.js];
    FE --> ID[Microsoft Entra ID];
    FE --> BFF[BFF Rotas API];
    BFF --> API[Backend Express];
    API --> ORM[Prisma ORM];
    ORM --> DB[SQL Server];
:::

Fluxo principal:

`Usuário → Frontend Next.js → BFF /api → API Express → Prisma → SQL Server`

---

## 2.3. Princípios arquiteturais

- **Separação de responsabilidades:** frontend, BFF, backend e persistência têm funções distintas.
- **Modularidade:** rotas, controllers, serviços, validadores e repositórios são separados por responsabilidade.
- **Segurança em camadas:** o frontend autentica; o backend autoriza a operação.
- **Regras centralizadas:** a camada de serviços coordena as regras de negócio.
- **Persistência abstraída:** Prisma concentra o acesso ao SQL Server.
- **Configuração por ambiente:** bancos, URLs e segredos são configurados por ambiente.
- **Rastreabilidade:** código, migrations, imagens e pipelines são versionados.
- **Evolução incremental:** a estratégia de hospedagem pode evoluir sem alterar a arquitetura lógica da aplicação.

---

## 2.4. Arquitetura do frontend

O frontend utiliza Next.js 15, React 19, TypeScript, Tailwind CSS e VisActor.

### 2.4.1. Responsabilidades

- renderizar páginas, layouts e componentes;
- conduzir a navegação entre módulos;
- exibir e validar formulários;
- apresentar dashboards, filtros, gráficos e relatórios;
- executar login via NextAuth e Microsoft Entra ID;
- recuperar o contexto do usuário autenticado;
- encaminhar chamadas ao backend por meio do BFF;
- adaptar menus e ações às permissões visíveis;
- tratar carregamento, ausência de dados, sucesso e falha.

### 2.4.2. Estrutura principal

```text
frontend/
├── src/
│   ├── app/              # páginas, layouts e rotas BFF
│   ├── components/       # componentes de interface
│   ├── hooks/            # hooks de consulta e interação
│   ├── lib/              # autenticação, API e utilitários
│   ├── config/           # configuração de navegação
│   └── types/            # contratos TypeScript
├── middleware.ts         # proteção de rotas
└── server.mjs            # execução em produção
```

### 2.4.3. Módulos funcionais

- **Intenções de venda:** `/sales-intention`.
- **Dashboard:** `/dashboard`.
- **Relatório por marca:** `/relatorios/marca`.
- **Relatório por vendedor:** `/relatorios/vendedor`.
- **Cadastro de fluxo de loja:** `/cadastro-fluxo-loja`.
- **Perfil:** `/perfil`.
- **Gestão de acessos:** `/admin/access-management`.

### 2.4.4. Comunicação com o backend

As páginas utilizam clientes em `frontend/src/lib/` e hooks em `frontend/src/hooks/`. O navegador não acessa o backend Express diretamente: as chamadas passam pelas rotas BFF em `/api`.

---

## 2.5. BFF - Backend for Frontend

O BFF é implementado pelos Route Handlers do Next.js e intermedeia a comunicação entre a interface e a API Express.

### 2.5.1. Responsabilidades

- validar a sessão NextAuth;
- recuperar a identidade do usuário autenticado;
- assinar e encaminhar a identidade ao backend;
- aplicar timeout nas chamadas;
- ocultar a URL interna da API do navegador;
- devolver respostas padronizadas para a interface.

### 2.5.2. Fluxo BFF

::: mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend
    participant BFF as BFF Next.js
    participant API as Backend Express
    participant DB as SQL Server

    U->>FE: Executa uma acao
    FE->>BFF: Chamada para /api
    BFF->>BFF: Valida sessao
    BFF->>API: Encaminha identidade assinada
    API->>API: Valida permissao
    API->>DB: Consulta ou persistencia
    DB-->>API: Resultado
    API-->>BFF: Resposta JSON
    BFF-->>FE: Resposta para interface
:::

### 2.5.3. Rotas BFF relevantes

- `/api/sales-intentions`: criar, consultar e alterar intenções.
- `/api/sales-intentions/search`: busca com filtros avançados.
- `/api/sales-intention-catalogs`: catálogos usados pelos formulários.
- `/api/sales-intention-modelos-dealer`: consulta de combinações de veículo e placa.
- `/api/store-flows`: cadastro do fluxo diário de loja.
- `/api/users/*`: usuários, perfis, permissões e telas.

---

## 2.6. Arquitetura do backend

O backend é uma API Express escrita em TypeScript. Sua organização separa transporte HTTP, validação, regras de negócio e acesso aos dados.

```text
backend/src/
├── auth/           # autenticação e autorização
├── controllers/    # adaptação HTTP
├── services/       # regras de negócio
├── repositories/   # acesso a dados via Prisma
├── routes/         # endpoints
├── validators/     # validação de entrada e filtros
├── entities/       # entidades de domínio
├── errors/         # erros padronizados
└── app.ts          # inicialização do Express
```

### 2.6.1. Responsabilidades das camadas

- **Routes:** mapeiam endpoint, middleware e controller.
- **Controllers:** adaptam a requisição HTTP e retornam a resposta.
- **Validators:** validam payloads, parâmetros e filtros.
- **Services:** aplicam regras de negócio e coordenam operações.
- **Repositories:** consultam e persistem dados pelo Prisma.
- **Auth:** valida a identidade e as permissões necessárias.

### 2.6.2. Fluxo interno da API

::: mermaid
graph LR;
    R[Route] --> A[Autenticacao e permissao];
    A --> C[Controller];
    C --> V[Validator];
    V --> S[Service];
    S --> REP[Repository];
    REP --> P[Prisma];
    P --> DB[SQL Server];
:::

### 2.6.3. Saúde e contrato

O backend disponibiliza:

- `GET /health` para verificação de disponibilidade;
- `GET /docs` para documentação Swagger;
- `GET /openapi.json` para o contrato OpenAPI.

---

## 2.7. Persistência e arquitetura de dados

Prisma é o ORM usado para acessar o SQL Server. O schema fica em `backend/prisma/schema.prisma` e as migrations versionadas ficam em `backend/prisma/migrations/`.

### 2.7.1. Dados persistidos

- **Operação:** intenções de venda e fluxo de loja.
- **Catálogos:** tipo de venda, bandeira, regional, loja, veículo e classificação.
- **Veículos:** marca, modelo, versão, ano e placa.
- **Segurança:** usuários, perfis, permissões e telas.
- **Auditoria:** usuário criador e datas de criação ou atualização.

### 2.7.2. Regras de ambiente

- `development`: utiliza o banco `salesdb_hml`.
- `homolog`: utiliza o banco `salesdb_hml`.
- `production`: utiliza o banco `salesdb`.

O ambiente lógico seleciona o banco esperado, mas não cria banco, não executa migrations automaticamente e não transfere dados entre ambientes.

### 2.7.3. Cuidados operacionais

- revisar `DATABASE_URL` antes de alterar schema;
- versionar migrations;
- não executar comandos destrutivos contra produção sem aprovação;
- configurar timeout e pool de conexão conforme carga e latência.

---

## 2.8. Autenticação e identidade

A autenticação corporativa utiliza Microsoft Entra ID por meio do NextAuth.

### 2.8.1. Componentes

- **Microsoft Entra ID:** provedor corporativo de identidade.
- **App Registration:** representa a aplicação no tenant corporativo.
- **NextAuth:** executa login, callback e sessão.
- **BFF:** recupera sessão e assina identidade para o backend.
- **Backend:** valida identidade, recupera usuário e permissões.

### 2.8.2. Fluxo de autenticação

::: mermaid
sequenceDiagram
    participant U as Usuario
    participant FE as Next.js
    participant ID as Microsoft Entra ID
    participant API as Backend

    U->>FE: Solicita login
    FE->>ID: Redireciona para autenticacao
    ID-->>FE: Retorna callback autorizado
    FE->>FE: Cria sessao NextAuth
    FE->>API: Envia identidade assinada
    API->>API: Valida assinatura e usuario
    API-->>FE: Autoriza requisicao
:::

### 2.8.3. Variáveis relevantes

- `AZURE_AD_CLIENT_ID`: identificador do aplicativo Entra ID.
- `AZURE_AD_CLIENT_SECRET`: segredo do aplicativo.
- `AZURE_AD_TENANT_ID`: identificador do tenant.
- `NEXTAUTH_URL`: URL pública do ambiente.
- `NEXTAUTH_SECRET`: segredo da sessão.
- `BACKEND_AUTH_SECRET`: segredo compartilhado entre BFF e backend.

---

## 2.9. Autorização e controle de acesso

A autorização combina perfis, permissões e telas liberadas por usuário.

Perfis existentes:

- **USER:** opera intenções conforme permissões atribuídas.
- **MANAGER:** opera intenções e relatórios conforme permissões atribuídas.
- **VIEWER:** consulta intenções e relatórios.
- **ADMIN:** administra usuários, perfis, permissões e telas.

### 2.9.1. Fluxo de autorização

::: mermaid
graph LR;
    U[Usuario autenticado] --> BFF[BFF];
    BFF --> API[Backend];
    API --> AUTH[Valida identidade];
    AUTH --> RBAC[Consulta perfis e permissoes];
    RBAC --> D{Permissao concedida};
    D --> OP[Executa operacao];
    D --> DENY[Retorna acesso negado];
:::

O frontend pode ocultar funcionalidades não permitidas, mas a autorização efetiva é responsabilidade do backend.

---

## 2.10. Fluxos de comunicação e contratos

### 2.10.1. Operações principais

- **Criar intenção:** formulário → BFF → API → validação → Prisma → SQL Server.
- **Consultar intenção:** tela → BFF → API → Prisma → SQL Server → tela.
- **Buscar por filtros:** tela → BFF → API → validator → repository → SQL Server.
- **Consultar placa:** formulário → BFF → API → catálogo de veículos → formulário.
- **Registrar fluxo de loja:** formulário → BFF → API → upsert diário → SQL Server.
- **Gerir acessos:** administração → BFF → API → RBAC → SQL Server.

### 2.10.2. Contratos

Alterações de payload, endpoint ou regra devem incluir:

1. atualização dos contratos TypeScript;
2. atualização da validação de backend;
3. testes unitários e de integração;
4. atualização do OpenAPI quando aplicável.

---

## 2.11. Arquitetura de implantação atual

### 2.11.1. Desenvolvimento sem Docker

- frontend: porta `3000`;
- backend: porta `4000`;
- SQL Server de desenvolvimento: porta `1434`.

```bash
pnpm install
pnpm dev:backend
pnpm dev
```

### 2.11.2. Desenvolvimento com Docker

- frontend: porta `3001`;
- backend: porta `4001`;
- SQL Server: porta `1433`.

```bash
pnpm docker:up
pnpm docker:down
```

### 2.11.3. Produção atual com Docker

::: mermaid
graph LR;
    U[Usuario] --> N[Nginx HTTPS];
    N --> FE[Frontend Next.js 3003];
    FE --> API[Backend Express 4000];
    API --> DB[SQL Server];
:::

Nginx é o ponto de entrada HTTP/HTTPS. Frontend, backend e banco não devem ser expostos diretamente à internet.

### 2.11.4. Produção nativa

O projeto também suporta execução nativa com Next.js, IIS ou PM2. Esse cenário deve manter TLS, proxy reverso, segredos e permissões equivalentes ao cenário containerizado.

---

## 2.12. Integração contínua e qualidade

### 2.12.1. Pipelines existentes

- `azure-pipelines.yml`: CI, build, validações e smoke tests configurados.
- `.github/workflows/`: automação complementar enquanto houver uso de GitHub Actions.

### 2.12.2. Ferramentas de qualidade

- ESLint para lint;
- TypeScript para validação de tipos;
- Vitest para testes unitários;
- Testing Library para testes de interface;
- Supertest para testes HTTP;
- Playwright para testes ponta a ponta.

### 2.12.3. Fluxo de entrega proposto

::: mermaid
graph LR;
    DEV[Desenvolvedor] --> REPO[Azure Repos];
    REPO --> CI[CI lint testes build];
    CI --> IMG[Imagem versionada];
    IMG --> HML[Homologacao];
    HML --> AP[Validacao e aprovacao];
    AP --> PRD[Producao];
:::

---

## 2.13. Arquitetura de hospedagem Azure

### 2.13.1. Objetivo

Definir uma arquitetura gerenciada no Azure para frontend e backend, preservando contêineres existentes e reduzindo a necessidade de administração de servidores.

> **Status:** proposta para validação técnica. Os serviços listados não devem ser considerados provisionados ou aprovados sem registro formal.

### 2.13.2. Serviços definidos

- **Azure Container Apps para frontend:** executa o contêiner Next.js.
- **Azure Container Apps para backend:** executa a API Express com ingresso interno.
- **Azure Container Registry:** armazena imagens privadas e versionadas.
- **Azure SQL Database:** primeira opção para banco gerenciado.
- **Azure SQL Managed Instance:** alternativa se houver incompatibilidade técnica relevante.
- **Azure Key Vault:** armazena segredos, certificados e connection strings.
- **Managed Identity:** permite acesso sem senha aos recursos Azure.
- **Application Insights e Log Analytics:** telemetria, logs e alertas.
- **Application Gateway WAF v2 ou equivalente corporativo:** protege a entrada HTTP/HTTPS.
- **Bicep:** define infraestrutura como código.
- **Azure DevOps Pipelines:** publica e promove versões.

### 2.13.3. Diagrama da arquitetura-alvo

::: mermaid
graph LR;
    U[Usuario corporativo] --> DNS[DNS corporativo];
    DNS --> WAF[Camada WAF];
    WAF --> FE[Container App Frontend];
    FE --> API[Container App Backend];
    API --> DB[Azure SQL Database];

    PIPE[Azure DevOps Pipelines] --> ACR[Azure Container Registry];
    ACR --> FE;
    ACR --> API;

    FE --> KV[Azure Key Vault];
    API --> KV;
    FE --> AI[Application Insights];
    API --> AI;
    AI --> LAW[Log Analytics];
:::

---

## 2.14. Rede e segurança Azure

### 2.14.1. Topologia proposta

- usuários acessam a aplicação pelo domínio corporativo e camada WAF aprovada;
- frontend é publicado somente pela camada de entrada aprovada;
- backend possui ingresso interno e não é acessível diretamente pelo usuário;
- banco não possui acesso público e utiliza Private Endpoint;
- Key Vault utiliza acesso privado e Managed Identity quando compatível;
- ACR permanece privado e recebe pull de imagens por Managed Identity;
- cada ambiente possui VNet própria ou sub-redes segregadas aprovadas por Redes;
- zonas privadas de DNS são usadas para recursos com Private Endpoint;
- saída de rede segue regras corporativas, NSG e rotas aprovadas.

### 2.14.2. Fluxo de segurança

::: mermaid
graph LR;
    U[Usuario] --> WAF[WAF];
    WAF --> FE[Frontend];
    FE --> API[Backend interno];
    API --> DB[Azure SQL Private Endpoint];

    FE --> MI1[Managed Identity];
    API --> MI2[Managed Identity];
    MI1 --> KV[Key Vault];
    MI2 --> KV;
    MI1 --> ACR[Container Registry];
    MI2 --> ACR;
:::

### 2.14.3. Controles obrigatórios

- HTTPS em toda comunicação externa;
- segredos fora do código-fonte;
- RBAC e princípio de privilégio mínimo;
- banco sem exposição pública;
- imagens privadas e versionadas;
- logs sem tokens, senhas ou dados sensíveis;
- aprovações antes de deploy produtivo;
- auditoria de mudanças e acessos administrativos.

---

## 2.15. Ambientes e promoção de versões

### Homologação

- valida integração, regras de negócio e smoke tests;
- utiliza frontend, backend, banco e Key Vault próprios;
- utiliza dados não produtivos;
- recebe versões originadas da branch de integração;
- é validada por time técnico e QA.

### Produção

- atende usuários corporativos;
- utiliza frontend, backend, banco e Key Vault próprios;
- armazena somente dados produtivos;
- recebe apenas artefatos previamente validados em homologação;
- exige aprovação do PO, do time técnico e da operação.

Não é permitido compartilhar banco, segredos ou dados produtivos entre homologação e produção.

---

## 2.16. Disponibilidade, escalabilidade e continuidade

### Homologação

- uma réplica mínima por serviço;
- escalabilidade manual ou limitada;
- sem SLA formal;
- endpoint `/health` disponível para smoke tests.

### Produção

- duas réplicas mínimas para frontend e backend;
- escalabilidade automática conforme carga;
- SLO inicial proposto de 99,5% mensal;
- backup gerenciado e restauração testada;
- RPO inicial proposto de até 24 horas;
- RTO inicial proposto de até 8 horas;
- rollback documentado e testado.

Antes da produção, devem ser validados:

1. compatibilidade entre Prisma, migrations e Azure SQL Database;
2. comportamento da aplicação com múltiplas réplicas;
3. conexões SQL, pool e timeouts;
4. backup e restauração;
5. rollback de aplicação e schema;
6. limites e capacidade dos serviços escolhidos.

---

## 2.17. Observabilidade e diagnóstico

Recursos propostos:

- **Application Insights:** telemetria de requisições, erros, latência e dependências.
- **Log Analytics:** centralização, retenção e consulta de logs.
- **Azure Monitor:** alertas operacionais e de infraestrutura.
- **`/health`:** health check e smoke tests.
- **OpenAPI:** diagnóstico e integração de APIs.
- **Azure DevOps:** auditoria de builds, deploys e aprovações.

Alertas mínimos de produção:

- indisponibilidade do frontend ou backend;
- falha no endpoint `/health`;
- aumento de erros HTTP 5xx;
- aumento de latência da API;
- falha de conexão com banco;
- falha de deploy, migration ou smoke test;
- expiração de segredo ou certificado.

---

## 2.18. Registro da decisão técnica

- **Identificador:** ADR-VC-001.
- **Título:** Hospedagem Azure do CAOA Venda Cantada Dash.
- **Status:** proposto para aprovação.
- **Decisão:** adotar Azure Container Apps para frontend e backend, Azure Container Registry para imagens, Azure Key Vault e Managed Identity para segredos e identidade de workload, e Application Insights com Log Analytics para observabilidade.
- **Banco:** Azure SQL Database como primeira opção. Azure SQL Managed Instance somente se a validação técnica exigir.
- **Entrada:** Application Gateway WAF v2 ou camada corporativa equivalente aprovada.
- **Alternativas avaliadas:** IIS/VM, Azure App Service, AKS e hospedagem atual.
- **Justificativa:** compatibilidade com Docker, menor esforço operacional, separação entre frontend e API e integração com serviços gerenciados Azure.
- **Consequências:** exige validação de rede, banco, segurança, infraestrutura como código, pipeline e operação.

---

## 2.19. Checklist de validação e aprovação

A definição de arquitetura estará concluída após aprovação ou exceção formal para todos os itens abaixo.

- [ ] Arquitetura atual e integrações confirmadas.
- [ ] Azure Container Apps aprovado para frontend e backend.
- [ ] Azure SQL Database validado pelo DBA ou alternativa formalmente registrada.
- [ ] Topologia de rede aprovada por Redes.
- [ ] Estratégia de entrada e WAF aprovada por Segurança.
- [ ] Ambientes de homologação e produção definidos.
- [ ] Requisitos de disponibilidade, RPO e RTO aprovados.
- [ ] Estratégia de backup, restauração e rollback aprovada.
- [ ] Estratégia de observabilidade e alertas aprovada.
- [ ] ADR-VC-001 aprovado e vinculado ao Work Item de implantação.

Responsáveis pela aprovação:

- Arquitetura;
- Segurança;
- Redes;
- DBA;
- DevOps ou Plataforma;
- PO ou Negócio.

---

## 2.20. Referências técnicas

Referências no repositório:

- dependências: `package.json`, `frontend/package.json` e `backend/package.json`;
- frontend: `frontend/src/`;
- autenticação: `frontend/src/lib/nextAuth.ts`;
- BFF: `frontend/src/app/api/`;
- backend: `backend/src/`;
- Prisma: `backend/prisma/schema.prisma`;
- migrations: `backend/prisma/migrations/`;
- Docker local: `docker-compose.yml`;
- Docker de produção: `docker-compose.prod.yml`;
- publicação: `deploy/`;
- pipeline Azure: `azure-pipelines.yml`;
- pipeline GitHub: `.github/workflows/`;
- testes E2E: `e2e/`.

Referências externas:

- [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/overview)
- [Ingress no Azure Container Apps](https://learn.microsoft.com/azure/container-apps/ingress)
- [Rede no Azure Container Apps](https://learn.microsoft.com/azure/container-apps/networking)
- [Segurança no Azure Container Apps](https://learn.microsoft.com/azure/container-apps/security)
- [Azure SQL Database](https://learn.microsoft.com/azure/azure-sql/database/)
- [Azure Key Vault](https://learn.microsoft.com/azure/key-vault/general/overview)
- [Conexão do Azure DevOps ao Azure](https://learn.microsoft.com/azure/devops/pipelines/library/connect-to-azure)

---

## 2.21. Considerações finais

O CAOA Venda Cantada Dash possui uma arquitetura modular, com frontend, BFF, backend e persistência separados. A arquitetura Azure proposta preserva essa separação e introduz serviços gerenciados para fortalecer segurança, observabilidade, rastreabilidade e operação.

A implantação só deve iniciar após o preenchimento do checklist, a aprovação do ADR-VC-001 e a definição das responsabilidades das áreas envolvidas.
