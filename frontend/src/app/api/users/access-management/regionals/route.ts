import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../../_lib/backendProxy';

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, '/users/access-management/regionals', {
    notFound: 'Nenhuma Regional foi encontrada.',
    responseError: 'Não foi possível carregar as regionais.',
    unavailable: 'Não foi possível consultar as regionais no momento.',
  });
}
