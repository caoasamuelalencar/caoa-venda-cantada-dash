import prisma from '../lib/prisma';
import { withPrismaRetry } from '../utils/prismaResilience';

export type StoreFlowInput = {
  regional: string;
  lojaVenda: string;
  fluxo: number;
};

function todayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export class StoreFlowRepository {
  public async saveToday(input: StoreFlowInput, createdByUserId: number) {
    const data = todayAtMidnight();

    return withPrismaRetry(() =>
      prisma.storeFlow.upsert({
        where: {
          data_regional_lojaVenda: {
            data,
            regional: input.regional,
            lojaVenda: input.lojaVenda,
          },
        },
        create: { ...input, data, createdByUserId },
        update: { fluxo: input.fluxo },
      }),
    );
  }
}
