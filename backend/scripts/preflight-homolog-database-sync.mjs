import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

function readEnvironment(fileName) {
  const path = resolve(process.cwd(), fileName);
  return dotenv.parse(readFileSync(path));
}

function createClient(databaseUrl) {
  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl }
    }
  });
}

async function getDatabaseName(client) {
  const rows = await client.$queryRawUnsafe('SELECT DB_NAME() AS database_name');
  return rows[0]?.database_name;
}

async function getSchema(client) {
  const [tables, views, columns, foreignKeys] = await Promise.all([
    client.$queryRawUnsafe(`
      SELECT TABLE_NAME AS name
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'dbo' AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `),
    client.$queryRawUnsafe(`
      SELECT TABLE_NAME AS name
      FROM INFORMATION_SCHEMA.VIEWS
      WHERE TABLE_SCHEMA = 'dbo'
      ORDER BY TABLE_NAME
    `),
    client.$queryRawUnsafe(`
      SELECT TABLE_NAME AS table_name, COLUMN_NAME AS column_name,
        DATA_TYPE AS data_type, IS_NULLABLE AS is_nullable
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'dbo'
        AND TABLE_NAME IN (
          'Permission', 'Role', 'RolePermission', 'Screen', 'StoreFlow',
          'User', 'UserRole', 'UserScreen'
        )
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `),
    client.$queryRawUnsafe(`
      SELECT
        fk.name AS foreign_key_name,
        OBJECT_NAME(fk.parent_object_id) AS child_table,
        OBJECT_NAME(fk.referenced_object_id) AS parent_table
      FROM sys.foreign_keys fk
      WHERE SCHEMA_NAME(fk.schema_id) = 'dbo'
      ORDER BY child_table, foreign_key_name
    `)
  ]);

  return { tables, views, columns, foreignKeys };
}

const sourceEnvironment = readEnvironment('.env.development');
const targetEnvironment = readEnvironment('.env.homolog');

if (!sourceEnvironment.DATABASE_URL || !targetEnvironment.DATABASE_URL) {
  throw new Error('DATABASE_URL precisa estar configurada nos arquivos de origem e Homologação.');
}

const source = createClient(sourceEnvironment.DATABASE_URL);
const target = createClient(targetEnvironment.DATABASE_URL);

try {
  const [sourceDatabase, targetDatabase] = await Promise.all([
    getDatabaseName(source),
    getDatabaseName(target)
  ]);

  if (sourceDatabase !== 'salesdb') {
    throw new Error(`Origem recusada: esperado salesdb, recebido ${sourceDatabase ?? 'desconhecido'}.`);
  }

  if (targetDatabase !== 'salesdb_hml') {
    throw new Error(`Destino recusado: esperado salesdb_hml, recebido ${targetDatabase ?? 'desconhecido'}.`);
  }

  const [sourceSchema, targetSchema] = await Promise.all([
    getSchema(source),
    getSchema(target)
  ]);

  console.log(JSON.stringify({
    sourceDatabase,
    targetDatabase,
    source: sourceSchema,
    target: targetSchema
  }, null, 2));
} finally {
  await Promise.all([source.$disconnect(), target.$disconnect()]);
}
