import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../../_lib/backendProxy';

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, '/users/access-management/context', {
    notFound: 'Contexto de acesso não encontrado.',
    responseError: 'Você não possui acesso à gestão de acessos.',
    unavailable: 'Não foi possível validar seu acesso administrativo.',
  });
}
