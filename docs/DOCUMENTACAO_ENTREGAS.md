# Funcionalidades entregues

Este documento descreve o estado funcional atual do CAOA Venda Cantada Dash.
Para arquitetura, rotas e operação, consulte também [PROJECT_MAP.md](./PROJECT_MAP.md),
[access-control.md](./access-control.md) e o [README](../README.md).

## Plataforma e autenticação

- Frontend em Next.js 15 e React 19; API em Express com Prisma e SQL Server.
- Login corporativo por Microsoft Entra ID usando NextAuth com sessão JWT.
- O perfil inclui dados do diretório corporativo e foto opcional obtida via Microsoft Graph.
- Há provedor de credenciais temporárias apenas quando as variáveis
  NEXTAUTH_FALLBACK_AUTH e NEXT_PUBLIC_FALLBACK_AUTH são configuradas como true.
  Ele é destinado à homologação e não substitui o login corporativo.
- As páginas internas validam sessão e as APIs validam a identidade assinada pelo BFF.

## Cadastro e consulta de intenções

- Formulário de intenção de venda com catálogos carregados pela API.
- Campos de veículo e classificação dependentes das seleções anteriores.
- Listagem e busca por período, tipo de venda e filtros avançados.
- Persistência do usuário criador em novos registros.
- Operações de criação, atualização e exclusão protegidas por permissão e escopo.

## Dashboard e relatórios

- Dashboard com totais por bandeira, rankings e links para o detalhe de cada bandeira.
- Períodos por dia, mês, ano e intervalo personalizado.
- Atalhos anuais para o ano atual e os três anos anteriores.
- Skeletons nos totais por bandeira durante carregamentos, sem exibir zeros provisórios.
- Detalhamento por bandeira preservando período e tipo de venda.
- Relatórios por marca de veículo e por vendedor, com filtros, gráficos, exportação e drill-down.

## Controle de acesso

A autorização é aplicada no backend, e não é definida pelo navegador.

| Perfil | Capacidades principais |
| --- | --- |
| USER | Opera intenções conforme suas permissões. |
| MANAGER | Opera intenções e relatórios conforme suas permissões. |
| VIEWER | Consulta intenções e relatórios conforme suas permissões. |
| ADMIN | Acesso administrativo e todas as permissões da plataforma. |

A tela /admin/access-management permite ao administrador:

- pesquisar e paginar usuários;
- editar perfis e status;
- selecionar as telas liberadas para cada usuário;
- excluir usuários de forma segura.

O sistema impede que um administrador exclua ou remova o próprio acesso, bem
como que o último administrador ativo seja removido, desativado ou excluído.

## APIs e qualidade

- Swagger disponível em /docs e contrato OpenAPI em /openapi.json no backend.
- BFF do Next.js expõe as rotas /api/* e encaminha as chamadas autenticadas ao Express.
- Testes unitários e de componente usam Vitest; integração de API usa Supertest;
  e fluxos E2E usam Playwright.
- Os comandos recomendados são pnpm typecheck, pnpm test:unit e pnpm test:e2e.

## Documentos históricos

- PERMISSAO_AUTO_LOGIN.md registra os requisitos que originaram a implementação
  de RBAC; o manual operacional é access-control.md.
- refactoring.md e performance.md registram decisões e medições de seus
  respectivos escopos, não um inventário completo da aplicação.
