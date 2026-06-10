import { Request, Response } from 'express';
import { SalesIntentionService } from '../services/SalesIntentionService';

const service = new SalesIntentionService();

export class SalesIntentionController {
  public async list(req: Request, res: Response) {
    const records = await service.listAll();
    res.json(records);
  }

  public async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
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
    const id = Number(req.params.id);
    const record = await service.update(id, req.body);
    res.json(record);
  }

  public async delete(req: Request, res: Response) {
    const id = Number(req.params.id);
    await service.remove(id);
    res.status(204).send();
  }
}
