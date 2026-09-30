import { NextResponse, type NextRequest } from 'next/server';
import { createHmac } from 'node:crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextAuth';
import { readRecordString } from '@/lib/azure-ad-profile';

const DEFAULT_REQUEST_TIMEOUT_MS = 30000;

function getRequestTimeoutMs() {
  const configuredValue = Number(process.env.BACKEND_REQUEST_TIMEOUT_MS);

  return Number.isFinite(configuredValue) && configuredValue >= 1000
    ? configuredValue
    : DEFAULT_REQUEST_TIMEOUT_MS;
}

function normalizeBaseUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.replace(/\/+$/, '');
}

function getBackendBaseUrls() {
  return Array.from(
    new Set(
      [
        normalizeBaseUrl(process.env.API_BASE_URL),
        normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL),
        'http://localhost:4000',
        'http://localhost:4001',
        'http://backend:4000'
      ].filter((value): value is string => Boolean(value))
    )
  );
}

async function buildBackendAuthorization() {
  const secret = process.env.BACKEND_AUTH_SECRET;
  if (!secret) {
    return { error: 'A integração segura com a API não está configurada.' } as const;
  }

  const session = await getServerSession(authOptions);
  const user = session?.user;
  const claims = user?.directory?.claims;
  const entraObjectId = readRecordString(claims, 'oid');
  const tenantId = readRecordString(claims, 'tid');
  const name = user?.name?.trim();

  if (!user || !entraObjectId || !tenantId || !name) {
    return { error: 'Sua sessão não possui uma identidade corporativa válida.' } as const;
  }

  const payload = {
    entraObjectId,
    tenantId,
    name,
    ...(user.email ? { email: user.email } : {}),
    ...(user.directory?.graph?.department
      ? { department: user.directory.graph.department }
      : {}),
    ...(user.directory?.graph?.jobTitle
      ? { jobTitle: user.directory.graph.jobTitle }
      : {}),
    exp: Date.now() + 5 * 60 * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  return { value: `${encodedPayload}.${signature}` } as const;
}

async function forwardResponse(response: Response) {
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = response.headers.get('content-type') ?? '';
  return new NextResponse(response.body, {
    status: response.status,
    headers: contentType
      ? { 'content-type': contentType }
      : { 'content-type': 'text/plain; charset=utf-8' }
  });
}

export async function proxyBackendRequest(
  request: NextRequest,
  path: string,
  messages: {
    notFound: string;
    responseError: string;
    unavailable: string;
  }
) {
  const backendAuthorization = await buildBackendAuthorization();
  if ('error' in backendAuthorization) {
    return NextResponse.json({ message: backendAuthorization.error }, { status: 401 });
  }

  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.delete('cookie');
  headers.delete('authorization');
  headers.delete('x-caoa-authorization');
  headers.set('x-caoa-authorization', backendAuthorization.value);

  const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text();
  const baseUrls = getBackendBaseUrls();

  for (const baseUrl of baseUrls) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), getRequestTimeoutMs());

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method: request.method,
        headers,
        body,
        signal: controller.signal
      });

      if (!response.ok) {
        return NextResponse.json(
          {
            message: response.status === 404 ? messages.notFound : messages.responseError
          },
          { status: response.status }
        );
      }

      return forwardResponse(response);
    } catch {
      // Try the next backend URL before giving up.
    } finally {
      clearTimeout(timeout);
    }
  }

  return NextResponse.json(
    {
      message: messages.unavailable
    },
    { status: 503 }
  );
}
