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
| MANAGER | REGIONAL | Vê e altera somente registros da própria regional. |
| VIEWER | REGIONAL | Vê somente registros da própria regional. |
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

1. Revise e aplique a migration em uma janela autorizada.
2. Configure o mesmo `BACKEND_AUTH_SECRET` no frontend e no backend.
3. Rode `pnpm --dir backend rbac:seed` uma única vez por banco para criar perfis e permissões.
4. Atribua o perfil ADMIN e a regional dos demais usuários por procedimento administrativo controlado.

Usuários MANAGER e VIEWER sem regional recebem erro de domínio e nunca têm escopo global.

## Administração

As APIs administrativas exigem `USER_VIEW` ou `USER_MANAGE` e são disponibilizadas
somente através do BFF autenticado:

| Método | Endpoint | Permissão |
| --- | --- | --- |
| `GET` | `/users?search=&role=&regional=&active=` | `USER_VIEW` |
| `PATCH` | `/users/:id/status` | `USER_MANAGE` |
| `PUT` | `/users/:id/roles` | `USER_MANAGE` |
| `PUT` | `/users/:id/regional` | `USER_MANAGE` |

O serviço recusa atribuir MANAGER/VIEWER sem regional e também recusa remover a
regional de um usuário que possua esses perfis.
