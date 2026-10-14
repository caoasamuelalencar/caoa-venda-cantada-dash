# Controle de acesso

O backend é a fonte de verdade para autorização. O Next.js obtém a sessão do
Microsoft Entra, assina uma identidade curta com `BACKEND_AUTH_SECRET` e o
Express valida essa assinatura antes de carregar o usuário local e suas
permissões.

O acesso é decidido somente pelas permissões vinculadas aos perfis do usuário.
Regional é um atributo de uma intenção de venda e pode ser usado nos filtros e
relatórios, mas não restringe o acesso de nenhum usuário.

## Permissão por tela

Além das permissões dos perfis, cada usuário possui uma lista explícita de telas
liberadas. O administrador configura essa lista em Gestão de acessos. As telas
atuais são Intenções de venda, Dashboard, Relatório por marca, Relatório por
vendedor, Perfil e Gestão de acessos.

O menu oculta telas não liberadas e o frontend redireciona tentativas de acesso
direto para `/access-denied`. A tela de Gestão de acessos continua exigindo o
perfil `ADMIN`, mesmo se estiver selecionada na lista do usuário.

A migration de criação preenche todas as telas para usuários já existentes,
preservando seus acessos atuais. Usuários criados no primeiro login devem ter
as telas liberadas por um administrador.

## Gestão de acessos

A página `/admin/access-management` e as rotas abaixo exigem o perfil `ADMIN`:

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| `GET` | `/users/access-management/context` | Contexto do administrador autenticado. |
| `GET` | `/users/access-management?search=&name=&email=&role=&active=&page=&pageSize=` | Lista paginada de usuários e perfis. |
| `GET` | `/users/roles` | Lista os perfis cadastrados. |
| `GET` | `/users/screens` | Lista as telas disponíveis para atribuição. |
| `GET` | `/users/:id/roles` | Consulta os perfis de um usuário. |
| `PUT` | `/users/:id/roles` | Substitui os perfis de um usuário. |
| `PUT` | `/users/:id/screens` | Substitui as telas liberadas para um usuário. |
| `PATCH` | `/users/:id/status` | Ativa ou desativa um usuário. |
| `DELETE` | `/users/:id` | Exclui um usuário e seus vínculos de perfis. |
| `GET` | `/users/me/access` | Retorna os perfis do usuário autenticado. |
| `GET` | `/users/me/screens` | Retorna as telas liberadas ao usuário autenticado. |

O backend impede que um administrador remova, desative ou exclua a própria
conta, bem como que o último administrador ativo seja removido, desativado ou
excluído. Ao excluir um usuário, as intenções históricas são preservadas e o
vínculo `createdByUserId` é removido.
