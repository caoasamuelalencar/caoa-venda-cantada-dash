import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../_lib/backendProxy';

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, '/sales-intentions', {
    notFound: 'O backend não encontrou a rota /sales-intentions. Reinicie a API com o código atualizado.',
    responseError: 'Não foi possível acessar as intenções de venda.',
    unavailable: 'Não foi possível acessar a API de intenções de venda.'
  });
}

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, '/sales-intentions', {
    notFound: 'O backend não encontrou a rota /sales-intentions. Reinicie a API com o código atualizado.',
    responseError: 'Não foi possível acessar as intenções de venda.',
    unavailable: 'Não foi possível acessar a API de intenções de venda.'
  });
}
