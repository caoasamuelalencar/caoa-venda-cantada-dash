/*
  Verificacao somente de leitura antes de clonar salesdb para salesdb_hml.
  Nao altera bancos, schemas ou dados.
*/
SET NOCOUNT ON;

SELECT
  name,
  state_desc,
  recovery_model_desc
FROM sys.databases
WHERE name IN (N'salesdb', N'salesdb_hml')
ORDER BY name;

SELECT
  DB_NAME(database_id) AS database_name,
  name AS logical_name,
  physical_name,
  type_desc
FROM sys.master_files
WHERE DB_NAME(database_id) IN (N'salesdb', N'salesdb_hml')
ORDER BY database_name, file_id;

SELECT
  type_desc,
  COUNT(*) AS total
FROM salesdb.sys.objects
WHERE is_ms_shipped = 0
GROUP BY type_desc
ORDER BY type_desc;

SELECT
  name,
  type_desc
FROM salesdb.sys.objects
WHERE name LIKE N'VW_IntencaoVendas%'
ORDER BY name;
