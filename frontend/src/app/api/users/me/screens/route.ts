import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../../_lib/backendProxy';

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, '/users/me/screens', {
    notFound: 'Telas de acesso não encontradas.',
    responseError: 'Não foi possível carregar suas telas de acesso.',
    unavailable: 'Não foi possível consultar suas telas de acesso no momento.',
  });
}
