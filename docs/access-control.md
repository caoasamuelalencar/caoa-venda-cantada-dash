# Controle de acesso

## Decisão de acesso

O acesso a uma intenção de venda exige os três fatores abaixo:

```text
Permission + Data Scope + Recurso = decisão de acesso
```

O browser jamais informa a permissão, a regional, o perfil ou o usuário autor da
intenção ao backend como fonte de verdade. O Next.js obtém a sessão Microsoft Entra,
assina uma identidade curta com `BACKEND_AUTH_SECRET` e o Express valida essa assinatura
antes de consultar o usuário local.

| Perfil | Escopo | Comportamento |
| --- | --- | --- |
| USER | OWN | Vê somente intenções cujo `createdByUserId` seja o seu usuário local. |
| MANAGER | REGIONAL | Vê e altera registros de uma ou mais Regionais atribuídas. |
| VIEWER | REGIONAL | Vê registros de uma ou mais Regionais atribuídas. |
| ADMIN | ALL | Acessa todas as regionais. |

Na presença de vários perfis, a precedência é explícita: `ADMIN` resulta em `ALL`;
na ausência de ADMIN, `MANAGER` ou `VIEWER` resulta em `REGIONAL`; caso contrário,
o escopo é `OWN`.

## Dados históricos

`SalesIntention.createdByUserId` é nullable. A migration não preenche registros
históricos; por isso, eles não são automaticamente atribuídos a usuários comuns.
MANAGER e VIEWER continuam vendo históricos de sua regional. Novas intenções recebem
o usuário autenticado no backend.

## Operação segura

### Desenvolvimento local

1. Configure `backend/.env.development` e `frontend/.env.development` a partir
   dos respectivos arquivos `.example`.
2. Use a URL do SQL Server Docker local em `backend/.env.development`; o banco
   isolado padrão de desenvolvimento é `localhost:1434 / salesdb`.
3. Defina o mesmo `BACKEND_AUTH_SECRET` nos dois arquivos.
4. Execute `pnpm dev:backend` e `pnpm dev` em terminais distintos.
5. Rode `pnpm --dir backend rbac:seed` para criar ou atualizar os perfis e as
   permissões no banco local.
6. Use `pnpm db:studio` somente para o ambiente local. O script força o
   carregamento de `backend/.env.development`.

Os scripts de desenvolvimento não executam migrations automaticamente. Para
aplicar as migrations revisadas no banco Docker, use deliberadamente:

```bash
pnpm --dir backend dev:prisma:migrate:deploy
```

### Produção

1. Revise e aplique a migration em uma janela autorizada.
2. Configure o mesmo `BACKEND_AUTH_SECRET` no frontend e no backend pelo
   mecanismo de segredos da produção.
3. Execute `pnpm --dir backend prod:rbac:seed` somente após aprovação e com a
   conexão de produção explicitamente configurada no ambiente do deploy.
4. Atribua o perfil ADMIN e a regional dos demais usuários por procedimento administrativo controlado.

Não execute `db push`, `migrate dev`, `migrate reset`, seeds ou Prisma Studio
contra produção a partir de uma estação de desenvolvimento.

Usuários MANAGER e VIEWER sem regional recebem erro de domínio e nunca têm escopo global.

## Administração

## Gestão de Acessos

A página `/admin/access-management` é exibida no menu somente quando o BFF
confirma que o usuário atual possui a role `ADMIN`. A ocultação do menu é apenas
uma melhoria de UX: todas as APIs abaixo exigem `ADMIN` no Express, a partir do
contexto de autorização carregado pelo banco local. Usuários autenticados sem
essa role recebem `403`; requisições sem identidade assinada recebem `401`.

Os perfis são obtidos da tabela `Role` e a associação é feita em `UserRole`.
Como a tabela intermediária possui chave composta (`userId`, `roleId`), a tela
permite múltiplos perfis por usuário.

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| `GET` | `/users/access-management/context` | Contexto do administrador autenticado. |
| `GET` | `/users/access-management?search=&name=&email=&role=&active=&page=&pageSize=` | Lista paginada de usuários e respectivos perfis. |
| `GET` | `/users/access-management/regionals` | Regionais distintas e ordenadas da view `VW_IntencaoVendas_Empresa`, para seleção administrativa. |
| `GET` | `/users/roles` | Lista dinâmica de perfis cadastrados. |
| `GET` | `/users/:id/roles` | Consulta os perfis de um usuário. |
| `PUT` | `/users/:id/roles` | Substitui, em transação, os perfis de um usuário. |
| `PATCH` | `/users/:id/status` | Ativa ou desativa um usuário. |
| `PUT` | `/users/:id/regional` | Compatibilidade: atualiza uma única Regional administrativa. |
| `PUT` | `/users/:id/regionals` | Substitui as Regionais administrativas atribuídas ao usuário. |
| `GET` | `/users/me/access` | Retorna os perfis, escopo e Regionais do usuário autenticado. |

Ao remover `ADMIN` ou desativar um administrador, o backend impede:

- que o administrador remova ou desative seu próprio acesso;
- que o último administrador ativo seja removido ou desativado.

Não há uma infraestrutura de auditoria persistente no projeto atualmente. O
registro de quem fez a alteração é uma melhoria futura recomendada; a mudança
de perfis permanece transacional e não deixa relações parciais em `UserRole`.

### APIs administrativas anteriores

Os endpoints administrativos são disponibilizados somente através do BFF
autenticado:

O serviço recusa atribuir MANAGER/VIEWER sem Regional e também recusa remover
todas as Regionais de um usuário que possua esses perfis. Para o escopo
`REGIONAL`, consultas e operações de escrita são limitadas à lista de Regionais
atribuídas ao usuário.

Na Gestão de Acessos, os grupos `A`, `CY`, `F`, `HY` e `S` selecionam as
Regionais cujo código começa pelo respectivo prefixo. A Regional `A definir`
permanece disponível apenas na seleção individual e não pertence a nenhum grupo.
