import type { Request, Response } from 'express';
import { badRequest, notFound } from '../errors/AppError';
import { UserRepository } from '../repositories/UserRepository';

const users = new UserRepository();

function parseId(value: string) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw badRequest('ID de usuário inválido.');
  return id;
}

function readText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export class UserController {
  public async list(req: Request, res: Response) {
    const active = req.query.active === undefined ? undefined : req.query.active === 'true';
    res.json(await users.list({
      search: readText(req.query.search), role: readText(req.query.role),
      regional: readText(req.query.regional), active,
    }));
  }

  public async updateStatus(req: Request, res: Response) {
    if (typeof req.body?.active !== 'boolean') throw badRequest('active deve ser booleano.');
    const user = await users.setActive(parseId(req.params.id), req.body.active);
    res.json({ id: user.id, active: user.active });
  }

  public async updateRoles(req: Request, res: Response) {
    const roleCodes = Array.isArray(req.body?.roles)
      ? (req.body.roles as unknown[]).filter((role): role is string => typeof role === 'string')
      : [];
    if (!roleCodes.length) throw badRequest('Informe pelo menos um perfil.');
    if (!await users.setRoles(parseId(req.params.id), roleCodes)) throw notFound('Usuário não encontrado.');
    res.status(204).send();
  }

  public async updateRegional(req: Request, res: Response) {
    const regional = typeof req.body?.regional === 'string' && req.body.regional.trim() ? req.body.regional.trim() : null;
    const user = await users.setRegional(parseId(req.params.id), regional);
    if (!user) throw notFound('Usuário não encontrado.');
    res.json({ id: user.id, regional: user.regional });
  }
}
