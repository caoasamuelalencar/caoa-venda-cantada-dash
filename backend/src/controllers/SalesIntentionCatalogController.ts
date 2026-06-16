import { Request, Response } from 'express';
import { SalesIntentionCatalogService } from '../services/SalesIntentionCatalogService';

const service = new SalesIntentionCatalogService();

export class SalesIntentionCatalogController {
  public async list(_req: Request, res: Response) {
    const records = await service.listAll();
    res.json(records);
  }
}
