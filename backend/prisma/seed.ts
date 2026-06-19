import { PrismaClient } from '@prisma/client';
import { salesIntentionSeedRows } from './seed-data/salesIntention';
import { salesIntentionCatalogSeedRows } from './seed-data/salesIntentionCatalog';

const prisma = new PrismaClient();

async function main() {
  await prisma.salesIntention.deleteMany();
  await prisma.salesIntentionCatalog.deleteMany();

  await prisma.salesIntention.createMany({ data: salesIntentionSeedRows });
  if (salesIntentionCatalogSeedRows.length > 0) {
    await prisma.salesIntentionCatalog.createMany({
      data: salesIntentionCatalogSeedRows.map((row) => ({
        tipoVenda: row.tipoVenda,
        bandeira: row.bandeira,
        regional: row.regional,
        lojaVenda: row.lojaVenda,
        marcaVeiculo: row.marcaVeiculo,
        versao: row.versao,
        classificacao: row.classificacao
      }))
    });
  }

  console.log('Seed data loaded.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
