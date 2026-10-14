import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../../_lib/backendProxy';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyBackendRequest(request, `/users/${id}/roles`, {
    notFound: 'Usuário não encontrado.',
    responseError: 'Não foi possível carregar os perfis do usuário.',
    unavailable: 'Não foi possível acessar a gestão de acessos.',
  });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  return proxyBackendRequest(request, `/users/${id}/roles`, {
    notFound: 'Usuário não encontrado.',
    responseError: 'Não foi possível atualizar os perfis do usuário.',
    unavailable: 'Não foi possível acessar a administração de usuários.',
  });
}
