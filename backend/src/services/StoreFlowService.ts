import { StoreFlowRepository, type StoreFlowInput } from '../repositories/StoreFlowRepository';

export class StoreFlowService {
  constructor(private readonly repository = new StoreFlowRepository()) {}

  public async saveToday(input: StoreFlowInput, createdByUserId: number) {
    return this.repository.saveToday(input, createdByUserId);
  }
}
