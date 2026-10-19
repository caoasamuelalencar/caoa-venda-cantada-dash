import { readFileSync } from 'node:fs';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

const tables = [
  'Permission',
  'Role',
  'User',
  'Screen',
  'RolePermission',
  'UserRole',
  'UserScreen',
  'StoreFlow',
  'VW_IntencaoVendas_ClassificacaoVenda',
  'VW_IntencaoVendas_Empresa',
  'VW_IntencaoVendas_ModelosDealer',
  'VW_IntencaoVendas_TipoVenda'
];

function createClient(environmentFile) {
  const environment = dotenv.parse(readFileSync(environmentFile));
  return new PrismaClient({ datasources: { db: { url: environment.DATABASE_URL } } });
}

async function databaseName(client) {
  const rows = await client.$queryRawUnsafe('SELECT DB_NAME() AS database_name');
  return rows[0]?.database_name;
}

async function counts(client) {
  const pairs = await Promise.all(tables.map(async (table) => {
    const rows = await client.$queryRawUnsafe(`SELECT COUNT_BIG(*) AS total FROM [dbo].[${table}]`);
    return [table, Number(rows[0].total)];
  }));

  return Object.fromEntries(pairs);
}

const source = createClient('.env.development');
const target = createClient('.env.homolog');

try {
  const [sourceDatabase, targetDatabase, sourceCounts, targetCounts, targetObjects] = await Promise.all([
    databaseName(source),
    databaseName(target),
    counts(source),
    counts(target),
    target.$queryRawUnsafe(`
      SELECT [name], RTRIM([type]) AS [type]
      FROM sys.objects
      WHERE schema_id = SCHEMA_ID(N'dbo')
        AND [name] LIKE N'VW_IntencaoVendas_%'
      ORDER BY [name]
    `)
  ]);

  if (sourceDatabase !== 'salesdb' || targetDatabase !== 'salesdb_hml') {
    throw new Error(`Bases inesperadas: origem=${sourceDatabase}, destino=${targetDatabase}.`);
  }

  const mismatches = tables.filter((table) => sourceCounts[table] !== targetCounts[table]);
  const nonTableCatalogs = targetObjects.filter((object) => object.type !== 'U');

  console.log(JSON.stringify({
    sourceDatabase,
    targetDatabase,
    sourceCounts,
    targetCounts,
    catalogObjects: targetObjects,
    mismatches,
    nonTableCatalogs,
    valid: mismatches.length === 0 && nonTableCatalogs.length === 0
  }, null, 2));

  if (mismatches.length > 0 || nonTableCatalogs.length > 0) {
    process.exitCode = 1;
  }
} finally {
  await Promise.all([source.$disconnect(), target.$disconnect()]);
}
