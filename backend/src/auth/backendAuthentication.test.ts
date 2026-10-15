import { describe, expect, it, vi } from 'vitest';

vi.mock('../repositories/UserRepository', () => ({
  UserRepository: class {},
}));

import { requireAdmin } from './backendAuthentication';

function runMiddleware(roles?: string[]) {
  const next = vi.fn();
  requireAdmin({ authorization: roles ? { roles } : undefined } as never, {} as never, next);
  return next;
}

describe('requireAdmin', () => {
  it('permite usuários com a role ADMIN', () => {
    const next = runMiddleware(['USER', 'ADMIN']);
    expect(next).toHaveBeenCalledWith();
  });

  it('bloqueia usuário autenticado sem ADMIN com 403', () => {
    const next = runMiddleware(['USER']);
    expect(next).toHaveBeenCalledOnce();
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
  });

  it('bloqueia contexto ausente', () => {
    const next = runMiddleware();
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
  });
});
