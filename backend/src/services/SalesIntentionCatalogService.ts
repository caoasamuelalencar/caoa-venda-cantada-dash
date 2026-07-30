import { SalesIntentionCatalogRepository } from '../repositories/SalesIntentionCatalogRepository';
import { SalesIntentionCatalogRow } from '../entities/SalesIntentionCatalog';

const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedCatalog: { records: SalesIntentionCatalogRow[]; expiresAt: number } | null = null;

export class SalesIntentionCatalogService {
  private repository = new SalesIntentionCatalogRepository();

  public async listAll() {
    if (cachedCatalog && cachedCatalog.expiresAt > Date.now()) {
      return cachedCatalog.records;
    }

    const records = await this.repository.findAll();
    cachedCatalog = {
      records,
      expiresAt: Date.now() + CATALOG_CACHE_TTL_MS
    };
    return records;
  }
}
