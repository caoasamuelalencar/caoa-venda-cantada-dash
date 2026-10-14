# Medição e otimização de performance

> Registro histórico de uma medição local. Os números abaixo não devem ser
> tratados como métricas atuais de produção; repita as medições após alterações
> relevantes de dependências, gráficos ou rotas.

## Ambiente e método

- Next.js 15.0.6, React 19 e build de produção local.
- Métrica de bundle: `First Load JS` emitido por `next build`.
- Validação de produção: `next start` local e testes Playwright existentes.
- Não foram estimados LCP, INP, CLS, TTFB, bytes transferidos ou tempos de banco: o
  ambiente não possui tráfego representativo, observabilidade de banco ou auditoria
  Lighthouse configurada. Esses números não devem ser inferidos do build.

## Gargalo encontrado

`ChartThemeProvider` era montado no provider global e importava
`@visactor/vchart/esm/vchart-all`. Com isso, o runtime de gráficos era incluído no
carregamento inicial até de rotas que não exibem gráficos.

## Alteração

- O runtime VisActor e o registro de tema foram movidos para
  `components/charts/vchart.tsx`.
- `components/charts/lazy-vchart.tsx` o carrega com `next/dynamic` e `ssr: false`.
- O chunk só é solicitado quando o contêiner do gráfico se aproxima da viewport
  (margem de 240 px), evitando o trabalho de inicialização durante a primeira pintura.
- Relatórios e detalhes de bandeira usam o wrapper lazy.
- O provider global de tema de gráfico, sem consumidores diretos, foi removido.

O runtime VisActor permanece disponível sob demanda, mas deixa de bloquear o JS
inicial das rotas analisadas. Além disso, foi substituído o registro completo da
biblioteca pelo build `vchart-simple`, suficiente para os gráficos de linha e barra
usados pela aplicação. No build local, o maior chunk associado ao runtime caiu de
2.079.851 para 1.277.876 bytes (redução de 801.975 bytes; 38,6%).

## Comparativo medido

| Rota | First Load JS antes | First Load JS depois | Redução |
| --- | ---: | ---: | ---: |
| `/relatorios/marca` | 691 kB | 171 kB | 520 kB (75%) |
| `/relatorios/vendedor` | 699 kB | 179 kB | 520 kB (74%) |
| `/dashboard/bandeiras/[bandeira]` | 714 kB | 193 kB | 521 kB (73%) |

O build de produção iniciou em aproximadamente 292 ms no ambiente local. Os dois
testes E2E existentes passaram contra esse build em 1,3 s no total. Esses valores
não representam latência de produção ou Core Web Vitals reais.

## Itens avaliados e não alterados

- Catálogos já são carregados em paralelo com `Promise.all` nas páginas que os usam.
- As APIs de catálogo usam `no-store`; não foi introduzido cache para evitar dados de
  catálogo desatualizados sem uma política explícita de invalidação.
- Os maiores ativos em `public/` foram auditados. O maior arquivo (2,0 MB) não é
  referenciado pelo código e não foi removido por poder ser um ativo operacional.
- Não foram observados scripts de terceiros carregados globalmente.

## Ajustes orientados pelo Lighthouse

- O logo de autenticação agora usa o otimizador do Next com `srcset`, `sizes`,
  qualidade 70 e `fetchPriority="high"`. O `<picture>` preserva a variação para
  tema escuro e o fallback existente.
- Os logos nos cartões do dashboard informam o `sizes` real (168/220 px), evitando
  a variante de 3840 px observada para `seminovos.png`.
- Avatares obtidos do Microsoft Graph usam a variante 96×96 no token de sessão;
  a rota continua aceitando a variante 240×240 como padrão compatível.

Uma nova auditoria Lighthouse deve medir os bytes finais de imagem, pois o formato
WebP/AVIF é negociado pelo otimizador do Next conforme o navegador do teste.

## Próximas medições recomendadas

Executar Lighthouse e RUM em homologação com dados reais, especialmente em dashboard
e relatórios, antes de otimizar imagens, virtualizar tabelas ou alterar cache de API.
