import { Request, Response } from 'express';
import { SalesIntentionCatalogService } from '../services/SalesIntentionCatalogService';

const service = new SalesIntentionCatalogService();

function encodeCatalog(records: Awaited<ReturnType<typeof service.listAll>>) {
  const fields = [
    'Tipo_Venda',
    'Bandeira',
    'Regional',
    'Loja_Venda',
    'Marca_Veiculo',
    'Versao',
    'Classificacao'
  ] as const;
  const dictionaries = fields.map(() => [] as string[]);
  const indexes = fields.map(() => new Map<string, number>());

  const combinations = records.map((record) =>
    fields.map((field, fieldIndex) => {
      const value = record[field];
      const existingIndex = indexes[fieldIndex].get(value);
      if (existingIndex !== undefined) return existingIndex;

      const nextIndex = dictionaries[fieldIndex].length;
      dictionaries[fieldIndex].push(value);
      indexes[fieldIndex].set(value, nextIndex);
      return nextIndex;
    })
  );

  return {
    version: 1,
    dictionaries,
    combinations
  };
}

export class SalesIntentionCatalogController {
  public async list(_req: Request, res: Response) {
    const records = await service.listAll();
    res.json(encodeCatalog(records));
  }
}
