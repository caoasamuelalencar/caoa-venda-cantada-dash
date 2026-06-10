import { SalesIntentionPayload } from '../entities/SalesIntention';
import { SalesIntentionRepository } from '../repositories/SalesIntentionRepository';

export class SalesIntentionService {
  private repository = new SalesIntentionRepository();

  public async listAll() {
    return this.repository.findAll();
  }

  public async getById(id: number) {
    return this.repository.findById(id);
  }

  public async create(payload: SalesIntentionPayload) {
    return this.repository.create(payload);
  }

  public async update(id: number, payload: Partial<SalesIntentionPayload>) {
    return this.repository.update(id, payload);
  }

  public async remove(id: number) {
    return this.repository.delete(id);
  }
}
