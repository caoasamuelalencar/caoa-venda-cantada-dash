import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../_lib/backendProxy';

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, '/users/me/access', {
    notFound: 'Dados de acesso não encontrados.',
    responseError: 'Não foi possível carregar seus dados de acesso.',
    unavailable: 'Não foi possível consultar seus dados de acesso no momento.',
  });
}
