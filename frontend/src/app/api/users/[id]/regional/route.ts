import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../../_lib/backendProxy';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyBackendRequest(request, `/users/${id}/regional`, {
    notFound: 'Usuário não encontrado.',
    responseError: 'Não foi possível atualizar a regional do usuário.',
    unavailable: 'Não foi possível acessar a administração de usuários.',
  });
}
