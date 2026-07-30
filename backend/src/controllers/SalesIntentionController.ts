import { Request, Response } from 'express';
import { SalesIntentionService } from '../services/SalesIntentionService';

const service = new SalesIntentionService();

function parseIdParam(value: string) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseDateParam(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export class SalesIntentionController {
  public async list(req: Request, res: Response) {
    const hasStartDate = req.query.startDate !== undefined;
    const hasEndDate = req.query.endDate !== undefined;
    let dateRange: { gte: Date; lt: Date } | undefined;
    const tipoVenda =
      typeof req.query.tipoVenda === 'string'
        ? req.query.tipoVenda.trim().toUpperCase()
        : undefined;

    if (tipoVenda && tipoVenda !== 'NOVOS' && tipoVenda !== 'SEMINOVOS') {
      res.status(400).json({
        message: 'tipoVenda deve ser NOVOS ou SEMINOVOS.'
      });
      return;
    }

    if (hasStartDate || hasEndDate) {
      const startDate = parseDateParam(req.query.startDate);
      const inclusiveEndDate = parseDateParam(req.query.endDate);

      if (!startDate || !inclusiveEndDate) {
        res.status(400).json({
          message: 'Informe startDate e endDate válidos no formato YYYY-MM-DD.'
        });
        return;
      }

      const exclusiveEndDate = new Date(
        inclusiveEndDate.getFullYear(),
        inclusiveEndDate.getMonth(),
        inclusiveEndDate.getDate() + 1
      );

      if (startDate >= exclusiveEndDate) {
        res.status(400).json({
          message: 'startDate não pode ser posterior a endDate.'
        });
        return;
      }

      dateRange = { gte: startDate, lt: exclusiveEndDate };
    }

    const records = await service.listAll(dateRange, tipoVenda);
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
