import { Request, Response } from 'express';
import { SalesIntentionService } from '../services/SalesIntentionService';
import {
  hasAdvancedSalesIntentionSearchFilters,
  parseSalesIntentionId,
  parseSalesIntentionListQuery,
  parseSalesIntentionSearchQuery
} from '../validators/salesIntentionQuery';

type SalesIntentionServicePort = Pick<
  SalesIntentionService,
  'listAll' | 'search' | 'getById' | 'create' | 'update' | 'remove'
>;

export class SalesIntentionController {
  constructor(private readonly service: SalesIntentionServicePort = new SalesIntentionService()) {}

  public async list(req: Request, res: Response) {
    if (hasAdvancedSalesIntentionSearchFilters(req.query)) {
      const filters = parseSalesIntentionSearchQuery(req.query);
      const records = await this.service.search(filters);
      res.json(records);
      return;
    }

    const { dateRange, tipoVenda } = parseSalesIntentionListQuery(req.query);
    const records = await this.service.listAll(dateRange, tipoVenda);
    res.json(records);
  }

  public async search(req: Request, res: Response) {
    const filters = parseSalesIntentionSearchQuery(req.query);
    const records = await this.service.search(filters);
    res.json(records);
  }

  public async getById(req: Request, res: Response) {
    const id = parseSalesIntentionId(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'ID inválido.' });
      return;
    }

    const record = await this.service.getById(id);
    if (!record) {
      res.status(404).json({ message: 'Registro não encontrado.' });
      return;
    }
    res.json(record);
  }

  public async create(req: Request, res: Response) {
    const record = await this.service.create(req.body);
    res.status(201).json(record);
  }

  public async update(req: Request, res: Response) {
    const id = parseSalesIntentionId(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'ID inválido.' });
      return;
    }

    const record = await this.service.update(id, req.body);
    if (!record) {
      res.status(404).json({ message: 'Registro não encontrado.' });
      return;
    }

    res.json(record);
  }

  public async delete(req: Request, res: Response) {
    const id = parseSalesIntentionId(req.params.id);
    if (!id) {
      res.status(400).json({ message: 'ID inválido.' });
      return;
    }

    const removed = await this.service.remove(id);
    if (!removed) {
      res.status(404).json({ message: 'Registro não encontrado.' });
      return;
    }

    res.status(204).send();
  }
}
