import type { Request, Response } from 'express';
import { badRequest } from '../errors/AppError';
import { StoreFlowService } from '../services/StoreFlowService';

const service = new StoreFlowService();

function readRequiredText(value: unknown, fieldName: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw badRequest(`${fieldName} é obrigatório.`);
  }
  return value.trim().replace(/\s+/g, ' ');
}

function readFlow(value: unknown) {
  const fluxo = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(fluxo) || fluxo <= 0 || fluxo > 1_000_000) {
    throw badRequest('Fluxo de loja deve ser um número inteiro entre 1 e 1000000.');
  }
  return fluxo;
}

export class StoreFlowController {
  public async saveToday(req: Request, res: Response) {
    const record = await service.saveToday({
      regional: readRequiredText(req.body?.regional, 'Regional'),
      lojaVenda: readRequiredText(req.body?.lojaVenda, 'Loja'),
      fluxo: readFlow(req.body?.fluxo),
    }, req.authorization!.id);

    res.status(201).json(record);
  }
}
