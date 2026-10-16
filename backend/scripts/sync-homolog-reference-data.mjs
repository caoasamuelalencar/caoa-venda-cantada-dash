import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { Prisma, PrismaClient } from '@prisma/client';

const apply = process.argv.includes('--apply');
const sourceFile = resolve(process.cwd(), '.env.development');
const targetFile = resolve(process.cwd(), '.env.homolog');
const catalogTables = [
  'VW_IntencaoVendas_ClassificacaoVenda',
  'VW_IntencaoVendas_Empresa',
  'VW_IntencaoVendas_ModelosDealer',
  'VW_IntencaoVendas_TipoVenda'
];

function loadEnvironment(file) {
  return dotenv.parse(readFileSync(file));
}

function createClient(url) {
  return new PrismaClient({ datasources: { db: { url } } });
}

async function databaseName(client) {
  const rows = await client.$queryRawUnsafe('SELECT DB_NAME() AS database_name');
  return rows[0]?.database_name;
}

async function objectTypes(client) {
  const rows = await client.$queryRawUnsafe(`
    SELECT name, type
    FROM sys.objects
    WHERE schema_id = SCHEMA_ID(N'dbo')
      AND name IN (
        N'Screen', N'UserScreen', N'StoreFlow',
        N'VW_IntencaoVendas_ClassificacaoVenda',
        N'VW_IntencaoVendas_Empresa',
        N'VW_IntencaoVendas_ModelosDealer',
        N'VW_IntencaoVendas_TipoVenda'
      )
  `);

  return new Map(rows.map((row) => [row.name, row.type.trim()]));
}

async function loadSourceData(source) {
  const [permissions, roles, users, screens, rolePermissions, userRoles, userScreens, storeFlows, ...catalogs] = await Promise.all([
    source.$queryRawUnsafe('SELECT [id], [code], [name] FROM [dbo].[Permission] ORDER BY [id]'),
    source.$queryRawUnsafe('SELECT [id], [code], [name] FROM [dbo].[Role] ORDER BY [id]'),
    source.$queryRawUnsafe(`
      SELECT [id], [entraObjectId], [tenantId], [name], [email], [department], [jobTitle],
        [active], [lastLoginAt], [createdAt], [updatedAt]
      FROM [dbo].[User] ORDER BY [id]
    `),
    source.$queryRawUnsafe('SELECT [id], [code], [name], [path], [sortOrder] FROM [dbo].[Screen] ORDER BY [id]'),
    source.$queryRawUnsafe('SELECT [roleId], [permissionId] FROM [dbo].[RolePermission]'),
    source.$queryRawUnsafe('SELECT [userId], [roleId] FROM [dbo].[UserRole]'),
    source.$queryRawUnsafe('SELECT [userId], [screenId] FROM [dbo].[UserScreen]'),
    source.$queryRawUnsafe(`
      SELECT [id], [regional], [lojaVenda], [fluxo], [data], [createdByUserId], [createdAt], [updatedAt]
      FROM [dbo].[StoreFlow] ORDER BY [id]
    `),
    ...catalogTables.map((table) => source.$queryRawUnsafe(`SELECT * FROM [dbo].[${table}]`))
  ]);

  return {
    permissions,
    roles,
    users,
    screens,
    rolePermissions,
    userRoles,
    userScreens,
    storeFlows,
    catalogs: Object.fromEntries(catalogTables.map((table, index) => [table, catalogs[index]]))
  };
}

function mapById(rows, key) {
  return new Map(rows.map((row) => [row.id, row[key]]));
}

function batches(rows, size = 150) {
  return Array.from({ length: Math.ceil(rows.length / size) }, (_, index) => rows.slice(index * size, (index + 1) * size));
}

async function replaceCatalogRows(tx, table, columns, rows) {
  await tx.$executeRawUnsafe(`DELETE FROM [dbo].[${table}]`);

  const tableName = Prisma.raw(`[dbo].[${table}]`);
  const columnNames = Prisma.join(columns.map((column) => Prisma.raw(`[${column}]`)));

  for (const batch of batches(rows)) {
    const values = Prisma.join(batch.map((row) => Prisma.sql`(${Prisma.join(columns.map((column) => row[column]))})`));
    await tx.$executeRaw(Prisma.sql`INSERT INTO ${tableName} (${columnNames}) VALUES ${values}`);
  }
}

async function syncData(target, data) {
  await target.$transaction(async (tx) => {
    for (const row of data.permissions) {
      await tx.$executeRaw`
        MERGE [dbo].[Permission] WITH (HOLDLOCK) AS target
        USING (SELECT ${row.code} AS [code], ${row.name} AS [name]) AS source
        ON target.[code] = source.[code]
        WHEN MATCHED THEN UPDATE SET [name] = source.[name]
        WHEN NOT MATCHED THEN INSERT ([code], [name]) VALUES (source.[code], source.[name]);
      `;
    }

    for (const row of data.roles) {
      await tx.$executeRaw`
        MERGE [dbo].[Role] WITH (HOLDLOCK) AS target
        USING (SELECT ${row.code} AS [code], ${row.name} AS [name]) AS source
        ON target.[code] = source.[code]
        WHEN MATCHED THEN UPDATE SET [name] = source.[name]
        WHEN NOT MATCHED THEN INSERT ([code], [name]) VALUES (source.[code], source.[name]);
      `;
    }

    for (const row of data.users) {
      await tx.$executeRaw`
        MERGE [dbo].[User] WITH (HOLDLOCK) AS target
        USING (
          SELECT ${row.entraObjectId} AS [entraObjectId], ${row.tenantId} AS [tenantId],
            ${row.name} AS [name], ${row.email} AS [email], ${row.department} AS [department],
            ${row.jobTitle} AS [jobTitle], ${row.active} AS [active], ${row.lastLoginAt} AS [lastLoginAt],
            ${row.createdAt} AS [createdAt], ${row.updatedAt} AS [updatedAt]
        ) AS source
        ON target.[tenantId] = source.[tenantId] AND target.[entraObjectId] = source.[entraObjectId]
        WHEN MATCHED THEN UPDATE SET
          [name] = source.[name], [email] = source.[email], [department] = source.[department],
          [jobTitle] = source.[jobTitle], [active] = source.[active], [lastLoginAt] = source.[lastLoginAt],
          [createdAt] = source.[createdAt], [updatedAt] = source.[updatedAt]
        WHEN NOT MATCHED THEN INSERT (
          [entraObjectId], [tenantId], [name], [email], [department], [jobTitle], [active],
          [lastLoginAt], [createdAt], [updatedAt]
        ) VALUES (
          source.[entraObjectId], source.[tenantId], source.[name], source.[email], source.[department],
          source.[jobTitle], source.[active], source.[lastLoginAt], source.[createdAt], source.[updatedAt]
        );
      `;
    }

    for (const row of data.screens) {
      await tx.$executeRaw`
        MERGE [dbo].[Screen] WITH (HOLDLOCK) AS target
        USING (
          SELECT ${row.code} AS [code], ${row.name} AS [name], ${row.path} AS [path],
            ${row.sortOrder} AS [sortOrder]
        ) AS source
        ON target.[code] = source.[code]
        WHEN MATCHED THEN UPDATE SET [name] = source.[name], [path] = source.[path], [sortOrder] = source.[sortOrder]
        WHEN NOT MATCHED THEN INSERT ([code], [name], [path], [sortOrder])
          VALUES (source.[code], source.[name], source.[path], source.[sortOrder]);
      `;
    }

    const [targetPermissions, targetRoles, targetUsers, targetScreens] = await Promise.all([
      tx.$queryRaw`SELECT [id], [code] FROM [dbo].[Permission]`,
      tx.$queryRaw`SELECT [id], [code] FROM [dbo].[Role]`,
      tx.$queryRaw`SELECT [id], [tenantId], [entraObjectId] FROM [dbo].[User]`,
      tx.$queryRaw`SELECT [id], [code] FROM [dbo].[Screen]`
    ]);

    const sourcePermissionCodes = mapById(data.permissions, 'code');
    const sourceRoleCodes = mapById(data.roles, 'code');
    const sourceUsers = new Map(data.users.map((row) => [row.id, `${row.tenantId}::${row.entraObjectId}`]));
    const sourceScreenCodes = mapById(data.screens, 'code');
    const targetPermissionIds = new Map(targetPermissions.map((row) => [row.code, row.id]));
    const targetRoleIds = new Map(targetRoles.map((row) => [row.code, row.id]));
    const targetUserIds = new Map(targetUsers.map((row) => [`${row.tenantId}::${row.entraObjectId}`, row.id]));
    const targetScreenIds = new Map(targetScreens.map((row) => [row.code, row.id]));

    for (const row of data.rolePermissions) {
      const roleId = targetRoleIds.get(sourceRoleCodes.get(row.roleId));
      const permissionId = targetPermissionIds.get(sourcePermissionCodes.get(row.permissionId));
      if (roleId === undefined || permissionId === undefined) throw new Error('Não foi possível resolver RolePermission no destino.');
      await tx.$executeRaw`
        IF NOT EXISTS (SELECT 1 FROM [dbo].[RolePermission] WHERE [roleId] = ${roleId} AND [permissionId] = ${permissionId})
          INSERT INTO [dbo].[RolePermission] ([roleId], [permissionId]) VALUES (${roleId}, ${permissionId});
      `;
    }

    for (const row of data.userRoles) {
      const userId = targetUserIds.get(sourceUsers.get(row.userId));
      const roleId = targetRoleIds.get(sourceRoleCodes.get(row.roleId));
      if (userId === undefined || roleId === undefined) throw new Error('Não foi possível resolver UserRole no destino.');
      await tx.$executeRaw`
        IF NOT EXISTS (SELECT 1 FROM [dbo].[UserRole] WHERE [userId] = ${userId} AND [roleId] = ${roleId})
          INSERT INTO [dbo].[UserRole] ([userId], [roleId]) VALUES (${userId}, ${roleId});
      `;
    }

    for (const row of data.userScreens) {
      const userId = targetUserIds.get(sourceUsers.get(row.userId));
      const screenId = targetScreenIds.get(sourceScreenCodes.get(row.screenId));
      if (userId === undefined || screenId === undefined) throw new Error('Não foi possível resolver UserScreen no destino.');
      await tx.$executeRaw`
        IF NOT EXISTS (SELECT 1 FROM [dbo].[UserScreen] WHERE [userId] = ${userId} AND [screenId] = ${screenId})
          INSERT INTO [dbo].[UserScreen] ([userId], [screenId]) VALUES (${userId}, ${screenId});
      `;
    }

    for (const row of data.storeFlows) {
      const userId = targetUserIds.get(sourceUsers.get(row.createdByUserId));
      if (userId === undefined) throw new Error('Não foi possível resolver o usuário de StoreFlow no destino.');
      await tx.$executeRaw`
        MERGE [dbo].[StoreFlow] WITH (HOLDLOCK) AS target
        USING (
          SELECT ${row.regional} AS [regional], ${row.lojaVenda} AS [lojaVenda], ${row.fluxo} AS [fluxo],
            ${row.data} AS [data], ${userId} AS [createdByUserId], ${row.createdAt} AS [createdAt],
            ${row.updatedAt} AS [updatedAt]
        ) AS source
        ON target.[data] = source.[data] AND target.[regional] = source.[regional] AND target.[lojaVenda] = source.[lojaVenda]
        WHEN MATCHED THEN UPDATE SET [fluxo] = source.[fluxo], [createdByUserId] = source.[createdByUserId],
          [createdAt] = source.[createdAt], [updatedAt] = source.[updatedAt]
        WHEN NOT MATCHED THEN INSERT ([regional], [lojaVenda], [fluxo], [data], [createdByUserId], [createdAt], [updatedAt])
          VALUES (source.[regional], source.[lojaVenda], source.[fluxo], source.[data], source.[createdByUserId], source.[createdAt], source.[updatedAt]);
      `;
    }

    await replaceCatalogRows(tx, 'VW_IntencaoVendas_ClassificacaoVenda', ['Descricao_Classificacao_Venda'], data.catalogs.VW_IntencaoVendas_ClassificacaoVenda);
    await replaceCatalogRows(tx, 'VW_IntencaoVendas_Empresa', ['Empresa_MarcaDescricao', 'Empresa_NomeFantasia', 'Regional_Vendas'], data.catalogs.VW_IntencaoVendas_Empresa);
    await replaceCatalogRows(tx, 'VW_IntencaoVendas_ModelosDealer', ['Marca', 'Modelo', 'Versao_Modelo', 'Ano', 'Placa', 'Tipo_Venda'], data.catalogs.VW_IntencaoVendas_ModelosDealer);
    await replaceCatalogRows(tx, 'VW_IntencaoVendas_TipoVenda', ['Descricao_TipoVenda'], data.catalogs.VW_IntencaoVendas_TipoVenda);
  }, { maxWait: 15_000, timeout: 120_000 });
}

const sourceEnvironment = loadEnvironment(sourceFile);
const targetEnvironment = loadEnvironment(targetFile);
const source = createClient(sourceEnvironment.DATABASE_URL);
const target = createClient(targetEnvironment.DATABASE_URL);

try {
  const [sourceDatabase, targetDatabase] = await Promise.all([databaseName(source), databaseName(target)]);
  if (sourceDatabase !== 'salesdb') throw new Error(`Origem recusada: esperado salesdb, recebido ${sourceDatabase ?? 'desconhecido'}.`);
  if (targetDatabase !== 'salesdb_hml') throw new Error(`Destino recusado: esperado salesdb_hml, recebido ${targetDatabase ?? 'desconhecido'}.`);

  const data = await loadSourceData(source);
  const expectedObjects = new Map([
    ['Screen', 'U'], ['UserScreen', 'U'], ['StoreFlow', 'U'],
    ...catalogTables.map((name) => [name, 'U'])
  ]);
  const targetObjects = await objectTypes(target);
  const invalidObjects = [...expectedObjects].filter(([name, type]) => targetObjects.get(name) !== type).map(([name]) => name);

  const summary = {
    sourceDatabase,
    targetDatabase,
    apply,
    sourceRows: {
      Permission: data.permissions.length,
      Role: data.roles.length,
      User: data.users.length,
      Screen: data.screens.length,
      RolePermission: data.rolePermissions.length,
      UserRole: data.userRoles.length,
      UserScreen: data.userScreens.length,
      StoreFlow: data.storeFlows.length,
      ...Object.fromEntries(catalogTables.map((table) => [table, data.catalogs[table].length]))
    }
  };

  if (invalidObjects.length > 0) {
    throw new Error(`Estrutura de homologação ainda não está pronta: ${invalidObjects.join(', ')}. Execute prisma migrate deploy antes da sincronização.`);
  }

  if (!apply) {
    console.log(JSON.stringify({ ...summary, message: 'Simulação concluída. Nenhum dado foi alterado. Execute com --apply para sincronizar.' }, null, 2));
  } else {
    await syncData(target, data);
    console.log(JSON.stringify({ ...summary, message: 'Sincronização concluída somente em salesdb_hml.' }, null, 2));
  }
} finally {
  await Promise.all([source.$disconnect(), target.$disconnect()]);
}
