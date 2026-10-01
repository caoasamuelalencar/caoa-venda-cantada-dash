const salesIntentionQueryParameters = [
  {
    name: 'startDate',
    in: 'query',
    required: false,
    description: 'Data inicial da busca no formato YYYY-MM-DD.',
    schema: {
      type: 'string',
      format: 'date',
      example: '2025-06-01'
    }
  },
  {
    name: 'endDate',
    in: 'query',
    required: false,
    description: 'Data final da busca no formato YYYY-MM-DD.',
    schema: {
      type: 'string',
      format: 'date',
      example: '2025-06-30'
    }
  },
  {
    name: 'tipoVenda',
    in: 'query',
    required: false,
    description: 'Filtra por tipo de venda.',
    schema: {
      type: 'string',
      example: 'NOVOS'
    }
  },
  {
    name: 'proprietario',
    in: 'query',
    required: false,
    description: 'Busca parcial pelo e-mail ou nome do proprietário.',
    schema: {
      type: 'string',
      example: 'hermano.batinga'
    }
  },
  {
    name: 'bandeira',
    in: 'query',
    required: false,
    description: 'Filtra pela bandeira do registro.',
    schema: {
      type: 'string',
      example: 'CAOA Chery'
    }
  },
  {
    name: 'lojaVenda',
    in: 'query',
    required: false,
    description: 'Busca pela loja de venda.',
    schema: {
      type: 'string',
      example: 'D21-7300-JOAO PESSOA'
    }
  },
  {
    name: 'marcaVeiculo',
    in: 'query',
    required: false,
    description: 'Busca pela marca do veículo.',
    schema: {
      type: 'string',
      example: 'CAOA Chery'
    }
  },
  {
    name: 'versao',
    in: 'query',
    required: false,
    description: 'Busca pela versão.',
    schema: {
      type: 'string',
      example: 'TIGGO 5X SPORT'
    }
  },
  {
    name: 'classificacao',
    in: 'query',
    required: false,
    description: 'Busca pela classificação.',
    schema: {
      type: 'string',
      example: 'PCD'
    }
  },
  {
    name: 'quantidade',
    in: 'query',
    required: false,
    description: 'Filtra pela quantidade exata.',
    schema: {
      type: 'integer',
      example: 1
    }
  },
  {
    name: 'ano_fabricacao',
    in: 'query',
    required: false,
    description: 'Filtra pelo ano de fabricação.',
    schema: {
      type: 'integer',
      example: 2025
    }
  },
  {
    name: 'ano_modelo',
    in: 'query',
    required: false,
    description: 'Filtra pelo ano do modelo.',
    schema: {
      type: 'integer',
      example: 2025
    }
  },
  {
    name: 'placa',
    in: 'query',
    required: false,
    description: 'Busca pela placa.',
    schema: {
      type: 'string',
      example: 'AAA1B12'
    }
  },
  {
    name: 'regional',
    in: 'query',
    required: false,
    description: 'Busca pela regional.',
    schema: {
      type: 'string',
      example: 'CY5'
    }
  }
] as const;

const salesIntentionModelosDealerLookupParameters = [
  {
    name: 'placa',
    in: 'query',
    required: true,
    description: 'Placa completa para localizar a combinação na view.',
    schema: {
      type: 'string',
      example: 'AAA-1234'
    }
  }
] as const;

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'CAOA Venda Cantada API',
    version: '0.1.0',
    description: 'API REST para gerenciar intenções de venda.'
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Servidor local'
    }
  ],
  tags: [
    {
      name: 'Health',
      description: 'Verificação de status da API'
    },
    {
      name: 'Sales Intentions',
      description: 'CRUD de intenções de venda'
    },
    {
      name: 'Sales Intention Catalogs',
      description: 'Catálogos de opções usados no formulário'
    },
    {
      name: 'Sales Intention Modelos Dealer',
      description: 'Combinações de tipo de venda, marca, modelo e versão para o formulário'
    }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Verifica se a API está online',
        responses: {
          '200': {
            description: 'API saudável',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: {
                      type: 'string',
                      example: 'ok'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/sales-intentions': {
      get: {
        tags: ['Sales Intentions'],
        summary: 'Lista as intenções de venda do mês corrente ou aplica filtros via querystring',
        parameters: salesIntentionQueryParameters,
        responses: {
          '200': {
            description: 'Lista de registros',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/SalesIntention'
                  }
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Sales Intentions'],
        summary: 'Cria uma nova intenção de venda',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SalesIntentionCreateInput'
              },
              examples: {
                default: {
                  value: {
                    proprietario: 'hermano.batinga@caoa.com.br',
                    tipoVenda: 'NOVOS',
                    bandeira: 'CAOA Chery',
                    lojaVenda: 'D21-7300-JOAO PESSOA',
                    marcaVeiculo: 'CAOA Chery',
                    versao: 'TIGGO 5X SPORT',
                    classificacao: 'PCD',
                    quantidade: 1,
                    dataSolicitacao: '2025-06-04T18:06:00.000Z',
                    ano_fabricacao: 2025,
                    ano_modelo: 2025,
                    placa: 'AAA1B12',
                    regional: 'CY5',
                    criado: '2025-06-04T18:06:00.000Z'
                  }
                }
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Registro criado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SalesIntention'
                }
              }
            }
          },
          '400': {
            description: 'Payload inválido'
          }
        }
      }
    },
    '/sales-intentions/search': {
      get: {
        tags: ['Sales Intentions'],
        summary: 'Busca intenções de venda usando querystring',
        parameters: salesIntentionQueryParameters,
        responses: {
          '200': {
            description: 'Lista de registros encontrados',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/SalesIntention'
                  }
                }
              }
            }
          }
        }
      }
    },
    '/sales-intentions/{id}': {
      get: {
        tags: ['Sales Intentions'],
        summary: 'Busca uma intenção de venda por ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
              example: 1
            }
          }
        ],
        responses: {
          '200': {
            description: 'Registro encontrado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SalesIntention'
                }
              }
            }
          },
          '404': {
            description: 'Registro não encontrado'
          }
        }
      },
      put: {
        tags: ['Sales Intentions'],
        summary: 'Atualiza uma intenção de venda',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
              example: 1
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/SalesIntentionUpdateInput'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Registro atualizado',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SalesIntention'
                }
              }
            }
          },
          '404': {
            description: 'Registro não encontrado'
          }
        }
      },
      delete: {
        tags: ['Sales Intentions'],
        summary: 'Remove uma intenção de venda',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: {
              type: 'integer',
              example: 1
            }
          }
        ],
        responses: {
          '204': {
            description: 'Registro removido'
          },
          '404': {
            description: 'Registro não encontrado'
          }
        }
      }
    },
    '/sales-intention-catalogs': {
      get: {
        tags: ['Sales Intention Catalogs'],
        summary: 'Lista as fontes segregadas do formulário de intenção',
        responses: {
          '200': {
            description: 'Fontes segregadas e combinações disponíveis para o formulário',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SalesIntentionCatalogResponse'
                }
              }
            }
          }
        }
      }
    },
    '/sales-intention-classificacoes': {
      get: {
        tags: ['Sales Intention Catalogs'],
        summary: 'Lista as opções do filtro Classificação da tela Relatórios / Marca com base na view VW_IntencaoVendas_ClassificacaoVenda',
        responses: {
          '200': {
            description: 'Opções do filtro Classificação disponíveis na tela Relatórios / Marca',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SalesIntentionClassificacaoVendaResponse'
                }
              }
            }
          }
        }
      }
    },
    '/sales-intention-modelos-dealer': {
      get: {
        tags: ['Sales Intention Modelos Dealer'],
        summary: 'Lista as combinações de tipo de venda, marca, modelo e versão da view VW_IntencaoVendas_ModelosDealer',
        responses: {
          '200': {
            description: 'Fontes segregadas e combinações disponíveis para o formulário de veículos',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SalesIntentionModelosDealerResponse'
                }
              }
            }
          }
        }
      }
    },
    '/sales-intention-modelos-dealer/by-placa': {
      get: {
        tags: ['Sales Intention Modelos Dealer'],
        summary: 'Busca uma combinação da view VW_IntencaoVendas_ModelosDealer pela placa',
        parameters: salesIntentionModelosDealerLookupParameters,
        responses: {
          '200': {
            description: 'Resultado da busca por placa',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SalesIntentionModelosDealerLookupResponse'
                }
              }
            }
          }
        }
      }
    },
    '/users/access-management': {
      get: {
        tags: ['Access Management'],
        summary: 'Lista paginada de usuários e seus perfis',
        description: 'Exige role ADMIN.',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'name', in: 'query', schema: { type: 'string' } },
          { name: 'email', in: 'query', schema: { type: 'string' } },
          { name: 'role', in: 'query', schema: { type: 'string', example: 'ADMIN' } },
          { name: 'active', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } }
        ],
        responses: {
          '200': { description: 'Página de usuários' },
          '401': { description: 'Identidade ausente ou inválida' },
          '403': { description: 'Acesso restrito a administradores' }
        }
      }
    },
    '/users/access-management/context': {
      get: {
        tags: ['Access Management'],
        summary: 'Retorna o contexto do administrador autenticado',
        responses: {
          '200': { description: 'Contexto administrativo' },
          '403': { description: 'Acesso restrito a administradores' }
        }
      }
    },
    '/users/access-management/regionals': {
      get: {
        tags: ['Access Management'],
        summary: 'Lista as regionais disponíveis para atribuição de acesso',
        description: 'Exige role ADMIN. Os valores vêm da view VW_IntencaoVendas_Empresa, sem duplicidade e ordenados.',
        responses: {
          '200': { description: 'Lista de regionais' },
          '403': { description: 'Acesso restrito a administradores' }
        }
      }
    },
    '/users/me/access': {
      get: {
        tags: ['Access Management'],
        summary: 'Retorna o acesso do usuário autenticado',
        responses: { '200': { description: 'Perfis, escopo e Regionais do usuário' }, '401': { description: 'Identidade ausente ou inválida' } }
      }
    },
    '/users/roles': {
      get: {
        tags: ['Access Management'],
        summary: 'Lista os perfis cadastrados',
        description: 'Exige role ADMIN.',
        responses: { '200': { description: 'Perfis disponíveis' }, '403': { description: 'Acesso restrito a administradores' } }
      }
    },
    '/users/{id}/roles': {
      get: {
        tags: ['Access Management'],
        summary: 'Consulta os perfis de um usuário',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: 'Usuário e perfis' }, '403': { description: 'Acesso restrito a administradores' }, '404': { description: 'Usuário não encontrado' } }
      },
      put: {
        tags: ['Access Management'],
        summary: 'Substitui os perfis de um usuário',
        description: 'Exige role ADMIN e protege o próprio/último administrador.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['roles'],
                properties: {
                  roles: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['USER', 'MANAGER']
                  }
                }
              }
            }
          }
        },
        responses: { '204': { description: 'Perfis atualizados' }, '400': { description: 'Payload inválido' }, '403': { description: 'Operação não permitida' }, '404': { description: 'Usuário não encontrado' } }
      }
    },
    '/users/{id}/regionals': {
      put: {
        tags: ['Access Management'],
        summary: 'Substitui as Regionais atribuídas ao usuário',
        description: 'Exige role ADMIN. Os grupos de Regionais são resolvidos pelo cliente antes do envio.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['regionals'], properties: { regionals: { type: 'array', items: { type: 'string' }, example: ['CY1', 'CY2'] } } } } }
        },
        responses: { '200': { description: 'Regionais atualizadas' }, '400': { description: 'Payload inválido' }, '403': { description: 'Operação não permitida' }, '404': { description: 'Usuário não encontrado' } }
      }
    }
  },
  components: {
    schemas: {
      SalesIntentionCatalogCombination: {
        type: 'object',
        properties: {
          tipoVenda: {
            type: 'string',
            example: 'NOVOS'
          },
          bandeira: {
            type: 'string',
            example: 'CAOA Chery'
          },
          regional: {
            type: 'string',
            example: 'CY1'
          },
          lojaVenda: {
            type: 'string',
            example: 'D21-0713-RIBEIRAO PRETO'
          },
          marcaVeiculo: {
            type: 'string',
            example: 'CAOA Chery'
          },
          versao: {
            type: 'string',
            example: 'TIGGO 5X SPORT'
          },
          classificacao: {
            type: 'string',
            example: 'Varejo'
          }
        }
      },
      SalesIntentionCatalogHierarchyRecord: {
        type: 'object',
        properties: {
          bandeira: {
            type: 'string',
            example: 'CAOA Chery'
          },
          regional: {
            type: 'string',
            example: 'CY1'
          },
          lojaVenda: {
            type: 'string',
            example: 'D21-0713-RIBEIRAO PRETO'
          }
        }
      },
      SalesIntentionCatalogSources: {
        type: 'object',
        properties: {
          tipoVenda: {
            type: 'array',
            items: { type: 'string' },
            example: ['NOVOS', 'SEMINOVOS']
          },
          bandeira: {
            type: 'array',
            items: { type: 'string' },
            example: ['CAOA Chery', 'HYUNDAI']
          },
          regional: {
            type: 'array',
            items: { type: 'string' },
            example: ['CY1', 'CY2', 'CY3']
          },
          lojaVenda: {
            type: 'array',
            items: { type: 'string' },
            example: ['D21-0713-RIBEIRAO PRETO', 'D21-7300-JOAO PESSOA']
          }
        }
      },
      SalesIntentionCatalogResponse: {
        type: 'object',
        properties: {
          version: {
            type: 'integer',
            example: 3
          },
          sources: {
            $ref: '#/components/schemas/SalesIntentionCatalogSources'
          },
          hierarchy: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/SalesIntentionCatalogHierarchyRecord'
            }
          },
          combinations: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/SalesIntentionCatalogCombination'
            }
          }
        }
      },
      SalesIntentionClassificacaoVendaResponse: {
        type: 'array',
        items: {
          type: 'string'
        },
        example: ['PCD', 'Varejo', 'Frota']
      },
      SalesIntentionModelosDealerRecord: {
        type: 'object',
        properties: {
          tipoVenda: {
            type: 'string',
            example: 'NOVOS'
          },
          marca: {
            type: 'string',
            example: 'FORD'
          },
          modelo: {
            type: 'string',
            example: 'RANGER'
          },
          versaoModelo: {
            type: 'string',
            example: '2BC - RANGER CB DUPLA 4X2'
          }
        }
      },
      SalesIntentionModelosDealerSources: {
        type: 'object',
        properties: {
          tipoVenda: {
            type: 'array',
            items: { type: 'string' },
            example: ['NOVOS', 'SEMINOVOS']
          },
          marca: {
            type: 'array',
            items: { type: 'string' },
            example: ['FORD', 'HYUNDAI']
          },
          modelo: {
            type: 'array',
            items: { type: 'string' },
            example: ['RANGER', 'HB20']
          },
          versaoModelo: {
            type: 'array',
            items: { type: 'string' },
            example: ['2BC - RANGER CB DUPLA 4X2', 'HBH NAO USAR']
          }
        }
      },
      SalesIntentionModelosDealerResponse: {
        type: 'object',
        properties: {
          version: {
            type: 'integer',
            example: 1
          },
          sources: {
            $ref: '#/components/schemas/SalesIntentionModelosDealerSources'
          },
          combinations: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/SalesIntentionModelosDealerRecord'
            }
          }
        }
      },
      SalesIntentionModelosDealerLookupRecord: {
        type: 'object',
        properties: {
          marcaVeiculo: {
            type: 'string',
            nullable: true,
            example: 'FORD'
          },
          modelo: {
            type: 'string',
            nullable: true,
            example: 'RANGER'
          },
          versao: {
            type: 'string',
            nullable: true,
            example: '2BC - RANGER CB DUPLA 4X2'
          },
          ano: {
            type: 'string',
            nullable: true,
            example: '2025'
          }
        }
      },
      SalesIntentionModelosDealerLookupResponse: {
        type: 'object',
        properties: {
          found: {
            type: 'boolean',
            example: true
          },
          record: {
            nullable: true,
            $ref: '#/components/schemas/SalesIntentionModelosDealerLookupRecord'
          }
        }
      },
      SalesIntention: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
            nullable: true
          },
          proprietario: {
            type: 'string',
            example: 'hermano.batinga@caoa.com.br'
          },
          tipoVenda: {
            type: 'string',
            example: 'NOVOS'
          },
          bandeira: {
            type: 'string',
            example: 'CAOA Chery'
          },
          lojaVenda: {
            type: 'string',
            example: 'D21-7300-JOAO PESSOA'
          },
          marcaVeiculo: {
            type: 'string',
            example: 'CAOA Chery'
          },
          versao: {
            type: 'string',
            example: 'TIGGO 5X SPORT'
          },
          classificacao: {
            type: 'string',
            example: 'PCD'
          },
          quantidade: {
            type: 'integer',
            example: 1
          },
          dataSolicitacao: {
            type: 'string',
            format: 'date-time',
            example: '2025-06-04T00:00:00.000Z'
          },
          ano_fabricacao: {
            type: 'integer',
            nullable: true,
            example: 2025
          },
          ano_modelo: {
            type: 'integer',
            nullable: true,
            example: 2025
          },
          placa: {
            type: 'string',
            example: 'AAA1B12'
          },
          regional: {
            type: 'string',
            example: 'CY5'
          },
          criado: {
            type: 'string',
            format: 'date-time',
            example: '2025-06-04T18:06:00.000Z'
          }
        },
        required: [
          'proprietario',
          'tipoVenda',
          'bandeira',
          'lojaVenda',
          'marcaVeiculo',
          'versao',
          'classificacao',
          'quantidade',
          'dataSolicitacao',
          'ano_fabricacao',
          'ano_modelo',
          'placa',
          'regional',
          'criado'
        ]
      },
      SalesIntentionCreateInput: {
        type: 'object',
        additionalProperties: false,
        required: [
          'proprietario',
          'tipoVenda',
          'bandeira',
          'lojaVenda',
          'marcaVeiculo',
          'versao',
          'classificacao',
          'quantidade',
          'dataSolicitacao',
          'placa',
          'regional'
        ],
        properties: {
          proprietario: { type: 'string' },
          tipoVenda: { type: 'string' },
          bandeira: { type: 'string' },
          lojaVenda: { type: 'string' },
          marcaVeiculo: { type: 'string' },
          versao: { type: 'string' },
          classificacao: { type: 'string' },
          quantidade: { type: 'integer' },
          dataSolicitacao: {
            type: 'string',
            format: 'date-time',
            description: 'Data e hora em ISO 8601. O formato legado DD/MM/YYYY HH:mm também é aceito.',
            example: '2025-06-04T18:06:00.000Z'
          },
          ano_fabricacao: {
            type: 'integer',
            nullable: true,
            example: 2025
          },
          ano_modelo: {
            type: 'integer',
            nullable: true,
            example: 2025
          },
          placa: { type: 'string' },
          regional: { type: 'string' },
          criado: {
            type: 'string',
            format: 'date-time',
            description: 'Opcional. Se omitido, o backend usa a data atual.'
          }
        }
      },
      SalesIntentionUpdateInput: {
        type: 'object',
        additionalProperties: false,
        properties: {
          proprietario: { type: 'string' },
          tipoVenda: { type: 'string' },
          bandeira: { type: 'string' },
          lojaVenda: { type: 'string' },
          marcaVeiculo: { type: 'string' },
          versao: { type: 'string' },
          classificacao: { type: 'string' },
          quantidade: { type: 'integer' },
          dataSolicitacao: {
            type: 'string',
            format: 'date-time',
            description: 'Data e hora em ISO 8601. O formato legado DD/MM/YYYY HH:mm também é aceito.'
          },
          ano_fabricacao: {
            type: 'integer',
            nullable: true
          },
          ano_modelo: {
            type: 'integer',
            nullable: true
          },
          placa: { type: 'string' },
          regional: { type: 'string' },
          criado: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
} as const;

export function getSwaggerHtml(specUrl: string) {
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>CAOA Venda Cantada API - Swagger</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      html { box-sizing: border-box; overflow-y: scroll; }
      *, *:before, *:after { box-sizing: inherit; }
      body { margin: 0; background: #f6f7fb; }
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #0f172a; }
      #swagger-ui { padding-bottom: 32px; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: ${JSON.stringify(specUrl)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        docExpansion: 'list',
        presets: [SwaggerUIBundle.presets.apis],
        layout: 'BaseLayout'
      });
    </script>
  </body>
</html>`;
}
