import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
const REQUEST_TIMEOUT_MS = 10000;

async function proxyRequest(request: NextRequest) {
  const targetUrl = `${API_BASE_URL}/sales-intentions`;
  const headers = new Headers(request.headers);
  headers.delete('host');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text(),
      signal: controller.signal
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            response.status === 404
              ? 'O backend não encontrou a rota /sales-intentions. Reinicie a API com o código atualizado.'
              : 'Não foi possível acessar as intenções de venda.'
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch {
    return NextResponse.json(
      {
        message:
          'Não foi possível acessar a API de intenções de venda. Verifique se o backend está rodando em ' +
          API_BASE_URL +
          '.'
      },
      { status: 503 }
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: NextRequest) {
  return proxyRequest(request);
}

export async function POST(request: NextRequest) {
  return proxyRequest(request);
}
