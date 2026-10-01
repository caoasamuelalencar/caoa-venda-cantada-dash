import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../_lib/backendProxy';

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, '/users/roles', {
    notFound: 'Perfis não encontrados.',
    responseError: 'Não foi possível carregar os perfis.',
    unavailable: 'Não foi possível acessar a gestão de acessos.',
  });
}
