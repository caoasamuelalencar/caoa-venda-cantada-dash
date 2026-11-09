import { describe, expect, it } from 'vitest';
import { isPrismaPoolTimeoutError } from './prismaResilience';

describe('isPrismaPoolTimeoutError', () => {
  it('identifica o timeout de pool do Prisma', () => {
    expect(isPrismaPoolTimeoutError({ code: 'P2024' })).toBe(true);
    expect(isPrismaPoolTimeoutError({ code: 'P2002' })).toBe(false);
    expect(isPrismaPoolTimeoutError(null)).toBe(false);
  });
});
