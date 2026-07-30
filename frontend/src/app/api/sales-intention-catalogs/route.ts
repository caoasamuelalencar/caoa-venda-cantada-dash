import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../_lib/backendProxy';

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, '/sales-intention-catalogs', {
    notFound:
      'O backend não encontrou a rota /sales-intention-catalogs. Reinicie a API com o código atualizado.',
    responseError: 'Não foi possível carregar os catálogos do formulário.',
    unavailable: 'Não foi possível acessar os catálogos do formulário.'
  });
}
