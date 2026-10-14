# Refatoração técnica

> Registro histórico de um escopo de refatoração. Consulte
> [PROJECT_MAP.md](./PROJECT_MAP.md) e [access-control.md](./access-control.md)
> para a arquitetura e a autorização em vigor.

## Escopo e preservação de comportamento

Esta refatoração preserva rotas, contratos HTTP, schema Prisma, variáveis de ambiente,
autenticação e comportamento visual. Nenhuma dependência de produção foi adicionada ou
atualizada. As alterações foram restringidas a separação de responsabilidades e
testabilidade do backend.

## Diagnóstico inicial

| Severidade | Área | Constatação | Decisão |
| --- | --- | --- | --- |
| Alta | Frontend | Páginas de dashboard e relatórios concentram entre 1.496 e 3.355 linhas. | Não fragmentadas sem testes de fluxo específicos; permanecem como risco técnico mapeado. |
| Alta | Backend | `SalesIntentionController` combinava adaptação HTTP com parsing/validação de query. | Parsing extraído para um módulo puro e testado. |
| Média | Backend | Controller dependia de uma instância global de service. | Dependência passou a ser injetável com implementação padrão. |
| Média | Performance | Páginas de analytics têm first-load JavaScript entre 691 e 714 kB. | Sem mudança neste escopo; requer profiling e validação visual antes de lazy-loading de gráficos. |
| Baixa | Segurança | As rotas de consulta validam IDs, datas e inteiros, mas a autenticação da API Express não é aplicada nas rotas. | Não alterado: a autorização atual é uma decisão de contrato/infraestrutura e requer alinhamento de produto. |

## Alterações executadas

- `backend/src/validators/salesIntentionQuery.ts` centraliza parsing de IDs, datas,
  inteiros, filtros repetidos e o cálculo de fim de data exclusivo usado pelo repositório.
- `SalesIntentionController` limita-se a coordenar request, service e response.
- O controller recebe uma porta mínima de service por construtor, mantendo
  `new SalesIntentionService()` como padrão de runtime.
- Foram adicionados testes unitários para o parser de query. Os testes de integração
  existentes continuam verificando os contratos HTTP.

## Itens não alterados intencionalmente

- Schema, migrations e provider SQL Server do Prisma.
- NextAuth, Azure AD e fluxos de credencial.
- Páginas e componentes grandes de dashboard/relatórios, por risco de regressão visual.
- Regras de filtro, inclusive datas locais e `tipoVenda`.

## Riscos e recomendações futuras

1. Criar testes de componente/E2E para cada seção dos relatórios antes de extrair
   componentes ou lazy-load de bibliotecas de gráfico.
2. Definir, com segurança e produto, a fronteira de autenticação/autorização da API
   Express antes de aplicar middleware a endpoints existentes.
3. Medir o bundle dos gráficos e avaliar importação dinâmica somente após estabelecer
   orçamento de performance e fluxo de fallback.
4. Introduzir logger estruturado em mudança própria; não substituir `console` de
   inicialização durante uma refatoração sem definição de observabilidade.
