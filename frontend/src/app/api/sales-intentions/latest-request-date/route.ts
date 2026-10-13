import type { NextRequest } from 'next/server';
import { proxyBackendRequest } from '../../_lib/backendProxy';

export async function GET(request: NextRequest) {
  return proxyBackendRequest(request, '/sales-intentions/latest-request-date', {
    notFound: 'Não foi possível localizar a última data com registros.',
    responseError: 'Não foi possível consultar a última data com registros.',
    unavailable: 'Não conseguimos consultar a última data com registros agora.',
  });
}
