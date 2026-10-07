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

function readOptionalBoolean(value: unknown) {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw badRequest('active deve ser true ou false.');
}

function readPositiveInteger(value: unknown, fieldName: string, defaultValue: number, maximum: number) {
  if (value === undefined) return defaultValue;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > maximum) {
    throw badRequest(`${fieldName} deve ser um número entre 1 e ${maximum}.`);
  }
  return parsed;
}

export class UserController {
  public async list(req: Request, res: Response) {
    res.json(await users.listAccessManagement({
      search: readText(req.query.search),
      name: readText(req.query.name),
      email: readText(req.query.email),
      role: readText(req.query.role),
      active: readOptionalBoolean(req.query.active),
      page: readPositiveInteger(req.query.page, 'page', 1, 1_000_000),
      pageSize: readPositiveInteger(req.query.pageSize, 'pageSize', 20, 100),
    }));
  }

  public async accessContext(req: Request, res: Response) {
    res.json({ userId: req.authorization!.id, isAdmin: true });
  }

  public async currentAccess(req: Request, res: Response) {
    const { roles } = req.authorization!;
    res.json({ roles });
  }

  public async currentScreens(req: Request, res: Response) {
    const screens = await users.getUserScreenCodes(req.authorization!.id);
    res.json({ screens: screens ?? [] });
  }

  public async listRoles(_req: Request, res: Response) {
    res.json(await users.listRoles());
  }

  public async listScreens(_req: Request, res: Response) {
    res.json(await users.listScreens());
  }

  public async getRoles(req: Request, res: Response) {
    const user = await users.getUserRoles(parseId(req.params.id));
    if (!user) throw notFound('Usuário não encontrado.');
    res.json(user);
  }

  public async updateStatus(req: Request, res: Response) {
    if (typeof req.body?.active !== 'boolean') throw badRequest('active deve ser booleano.');
    const user = await users.setActive(req.authorization!.id, parseId(req.params.id), req.body.active);
    if (!user) throw notFound('Usuário não encontrado.');
    res.json({ id: user.id, active: user.active });
  }

  public async remove(req: Request, res: Response) {
    if (!await users.remove(req.authorization!.id, parseId(req.params.id))) {
      throw notFound('Usuário não encontrado.');
    }
    res.status(204).send();
  }

  public async updateRoles(req: Request, res: Response) {
    const roleCodes = Array.isArray(req.body?.roles)
      ? (req.body.roles as unknown[]).filter((role): role is string => typeof role === 'string')
      : [];
    if (!roleCodes.length) throw badRequest('Informe pelo menos um perfil.');
    if (!await users.setRoles(req.authorization!.id, parseId(req.params.id), roleCodes)) {
      throw notFound('Usuário não encontrado.');
    }
    res.status(204).send();
  }

  public async updateScreens(req: Request, res: Response) {
    const screenCodes = Array.isArray(req.body?.screens)
      ? (req.body.screens as unknown[]).filter((screen): screen is string => typeof screen === 'string')
      : [];
    if (!await users.setScreens(req.authorization!.id, parseId(req.params.id), screenCodes)) {
      throw notFound('Usuário não encontrado.');
    }
    res.status(204).send();
  }

}
