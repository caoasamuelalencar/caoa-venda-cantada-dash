import { Request, Response } from 'express';
import { SalesIntentionService } from '../services/SalesIntentionService';

const service = new SalesIntentionService();

function parseIdParam(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export class SalesIntentionController {
  public async list(req: Request, res: Response) {
    const records = await service.listAll();
    res.json(records);
  }

  public async getById(req: Request, res: Response) {
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'ID inválido.' });
      return;
    }

    const record = await service.getById(id);
    if (!record) {
      res.status(404).json({ message: 'Registro não encontrado.' });
      return;
    }
    res.json(record);
  }

  public async create(req: Request, res: Response) {
    const record = await service.create(req.body);
    res.status(201).json(record);
  }

  public async update(req: Request, res: Response) {
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'ID inválido.' });
      return;
    }

    const record = await service.update(id, req.body);
    if (!record) {
      res.status(404).json({ message: 'Registro não encontrado.' });
      return;
    }

    res.json(record);
  }

  public async delete(req: Request, res: Response) {
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'ID inválido.' });
      return;
    }

    const removed = await service.remove(id);
    if (!removed) {
      res.status(404).json({ message: 'Registro não encontrado.' });
      return;
    }

    res.status(204).send();
  }
}
