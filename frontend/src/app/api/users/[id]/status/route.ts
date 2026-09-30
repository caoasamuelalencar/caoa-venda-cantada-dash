import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../../_lib/backendProxy';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  return proxyBackendRequest(request, `/users/${params.id}/status`, {
    notFound: 'Usuário não encontrado.',
    responseError: 'Não foi possível atualizar o status do usuário.',
    unavailable: 'Não foi possível acessar a administração de usuários.',
  });
}
