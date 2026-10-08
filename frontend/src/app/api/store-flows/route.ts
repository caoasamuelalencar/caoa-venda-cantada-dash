import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../_lib/backendProxy';

export async function POST(request: NextRequest) {
  return proxyBackendRequest(request, '/store-flows', {
    notFound: 'Não foi possível localizar o serviço de fluxo de loja.',
    responseError: 'Não foi possível salvar o fluxo de loja no momento.',
    unavailable: 'Não conseguimos acessar o serviço de fluxo de loja no momento.',
  });
}
