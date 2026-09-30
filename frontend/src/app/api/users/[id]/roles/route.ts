import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../../_lib/backendProxy';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  return proxyBackendRequest(request, `/users/${params.id}/roles`, {
    notFound: 'Usuário não encontrado.',
    responseError: 'Não foi possível atualizar os perfis do usuário.',
    unavailable: 'Não foi possível acessar a administração de usuários.',
  });
}
