import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
const REQUEST_TIMEOUT_MS = 10000;

export async function GET(request: NextRequest) {
  const targetUrl = `${API_BASE_URL}/sales-intention-catalogs`;
  const headers = new Headers(request.headers);
  headers.delete('host');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            response.status === 404
              ? 'O backend não encontrou a rota /sales-intention-catalogs. Reinicie a API com o código atualizado.'
              : 'Não foi possível carregar os catálogos do formulário.'
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      {
        message:
          'Não foi possível acessar os catálogos do formulário. Verifique se o backend está rodando em ' +
          API_BASE_URL +
          '.'
      },
      { status: 503 }
    );
  } finally {
    clearTimeout(timeout);
  }
}
