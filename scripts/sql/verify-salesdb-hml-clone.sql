/* Verificacao somente de leitura da clonagem salesdb -> salesdb_hml. */
SET NOCOUNT ON;

SELECT N'Permission' AS table_name,
  (SELECT COUNT(*) FROM salesdb.dbo.[Permission]) AS salesdb_rows,
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[Permission]) AS salesdb_hml_rows
UNION ALL SELECT N'Role',
  (SELECT COUNT(*) FROM salesdb.dbo.[Role]),
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[Role])
UNION ALL SELECT N'Screen',
  (SELECT COUNT(*) FROM salesdb.dbo.[Screen]),
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[Screen])
UNION ALL SELECT N'User',
  (SELECT COUNT(*) FROM salesdb.dbo.[User]),
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[User])
UNION ALL SELECT N'SalesIntention',
  (SELECT COUNT(*) FROM salesdb.dbo.[SalesIntention]),
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[SalesIntention])
UNION ALL SELECT N'SalesIntentionCatalog',
  (SELECT COUNT(*) FROM salesdb.dbo.[SalesIntentionCatalog]),
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[SalesIntentionCatalog])
UNION ALL SELECT N'SalesIntentionOptionCombination',
  (SELECT COUNT(*) FROM salesdb.dbo.[SalesIntentionOptionCombination]),
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[SalesIntentionOptionCombination])
UNION ALL SELECT N'StoreFlow',
  (SELECT COUNT(*) FROM salesdb.dbo.[StoreFlow]),
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[StoreFlow])
UNION ALL SELECT N'VW_IntencaoVendas_Empresa',
  (SELECT COUNT(*) FROM salesdb.dbo.[VW_IntencaoVendas_Empresa]),
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[VW_IntencaoVendas_Empresa])
UNION ALL SELECT N'VW_IntencaoVendas_ClassificacaoVenda',
  (SELECT COUNT(*) FROM salesdb.dbo.[VW_IntencaoVendas_ClassificacaoVenda]),
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[VW_IntencaoVendas_ClassificacaoVenda])
UNION ALL SELECT N'VW_IntencaoVendas_ModelosDealer',
  (SELECT COUNT(*) FROM salesdb.dbo.[VW_IntencaoVendas_ModelosDealer]),
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[VW_IntencaoVendas_ModelosDealer])
UNION ALL SELECT N'_prisma_migrations',
  (SELECT COUNT(*) FROM salesdb.dbo.[_prisma_migrations]),
  (SELECT COUNT(*) FROM salesdb_hml.dbo.[_prisma_migrations]);
