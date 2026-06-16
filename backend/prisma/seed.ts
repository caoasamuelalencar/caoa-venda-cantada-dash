import { PrismaClient } from '@prisma/client';
import { salesIntentionSeedRows } from './seed-data/salesIntention';
import { salesIntentionCatalogSeedRows } from './seed-data/salesIntentionCatalog';

const prisma = new PrismaClient();

function toSqlLiteral(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

async function main() {
  await prisma.salesIntention.deleteMany();
  await prisma.salesIntention.createMany({ data: salesIntentionSeedRows });
  await prisma.$executeRawUnsafe('DELETE FROM "SalesIntentionCatalog";');

  if (salesIntentionCatalogSeedRows.length > 0) {
    const valuesSql = salesIntentionCatalogSeedRows
      .map(
        (row) =>
          `(${[
            toSqlLiteral(row.tipoVenda),
            toSqlLiteral(row.bandeira),
            toSqlLiteral(row.regional),
            toSqlLiteral(row.lojaVenda),
            toSqlLiteral(row.marcaVeiculo),
            toSqlLiteral(row.versao),
            toSqlLiteral(row.classificacao)
          ].join(', ')})`
      )
      .join(',\n');

    await prisma.$executeRawUnsafe(
      `INSERT INTO "SalesIntentionCatalog" ("tipoVenda", "bandeira", "regional", "lojaVenda", "marcaVeiculo", "versao", "classificacao") VALUES ${valuesSql};`
    );
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
