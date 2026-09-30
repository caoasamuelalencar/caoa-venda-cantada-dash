import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { forbidden, serviceUnavailable, unauthorized } from '../errors/AppError';
import { UserRepository } from '../repositories/UserRepository';
import type { AuthorizationContext, EntraIdentity, PermissionCode } from './authorization';

type SignedIdentity = EntraIdentity & { exp: number };

function getSharedSecret() {
  const secret = process.env.BACKEND_AUTH_SECRET;
  if (!secret) throw serviceUnavailable('BACKEND_AUTH_SECRET não está configurado.');
  return secret;
}

function parseSignedIdentity(value: string | undefined): SignedIdentity {
  if (!value) throw unauthorized('Identidade de autenticação ausente.');
  const [encodedPayload, signature] = value.split('.');
  if (!encodedPayload || !signature) throw unauthorized('Identidade de autenticação inválida.');

  const expected = createHmac('sha256', getSharedSecret()).update(encodedPayload).digest('base64url');
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) {
    throw unauthorized('Assinatura de autenticação inválida.');
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as SignedIdentity;
    if (!payload.entraObjectId || !payload.tenantId || !payload.name || payload.exp <= Date.now()) {
      throw unauthorized('Identidade de autenticação expirada ou incompleta.');
    }
    return payload;
  } catch (error) {
    if (error instanceof Error && error.name === 'AppError') throw error;
    throw unauthorized('Identidade de autenticação inválida.');
  }
}

declare global {
  namespace Express {
    interface Request {
      authorization?: AuthorizationContext;
    }
  }
}

const users = new UserRepository();

export async function authenticateBackendRequest(req: Request, _res: Response, next: NextFunction) {
  try {
    const signedIdentity = parseSignedIdentity(req.header('x-caoa-authorization'));
    const { exp: _exp, ...identity } = signedIdentity;
    const context = await users.synchronizeEntraUser(identity);
    req.authorization = context;
    next();
  } catch (error) {
    next(error);
  }
}

export function requirePermission(permission: PermissionCode) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.authorization?.permissions.includes(permission)) {
      next(forbidden('Você não possui permissão para executar esta ação.'));
      return;
    }
    next();
  };
}
