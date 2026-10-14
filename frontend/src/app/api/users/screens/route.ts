import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../_lib/backendProxy';

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, '/users/screens', {
    notFound: 'Nenhuma tela foi encontrada.',
    responseError: 'Não foi possível carregar as telas.',
    unavailable: 'Não foi possível acessar a administração de usuários.',
  });
}
