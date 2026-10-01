import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../_lib/backendProxy';

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, `/users/access-management${request.nextUrl.search}`, {
    notFound: 'Não foi possível localizar usuários.',
    responseError: 'Não foi possível carregar a gestão de acessos.',
    unavailable: 'Não foi possível acessar a gestão de acessos.',
  });
}
