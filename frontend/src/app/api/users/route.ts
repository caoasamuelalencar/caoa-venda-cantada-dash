import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../_lib/backendProxy';

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, `/users${request.nextUrl.search}`, {
    notFound: 'Não foi possível localizar usuários.',
    responseError: 'Não foi possível carregar usuários.',
    unavailable: 'Não foi possível acessar a administração de usuários.',
  });
}
