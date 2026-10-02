import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../_lib/backendProxy';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return proxyBackendRequest(request, `/users/${encodeURIComponent(id)}`, {
    notFound: 'Usuário não encontrado.',
    responseError: 'Não foi possível excluir o usuário.',
    unavailable: 'Não foi possível acessar a gestão de usuários.'
  });
}
