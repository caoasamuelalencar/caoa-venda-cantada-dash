/*
  Clona a estrutura e os dados de salesdb para salesdb_hml no SQL Server local.

  Seguranca:
  - salesdb e usado somente como origem.
  - O backup e validado antes de qualquer alteracao no destino.
  - Apenas salesdb_hml pode ser removido/substituido.
  - COPY_ONLY nao interfere na cadeia regular de backups da origem.

  Este script foi preparado para o SQL Server em container Linux.
*/
USE master;
GO

IF DB_ID(N'salesdb') IS NULL
BEGIN
  THROW 50001, 'A base de origem salesdb nao existe.', 1;
END;
GO

BACKUP DATABASE [salesdb]
TO DISK = N'/var/opt/mssql/backup/salesdb_to_salesdb_hml.bak'
WITH COPY_ONLY, INIT, COMPRESSION, CHECKSUM, STATS = 5;
GO

RESTORE VERIFYONLY
FROM DISK = N'/var/opt/mssql/backup/salesdb_to_salesdb_hml.bak'
WITH CHECKSUM;
GO

IF DB_ID(N'salesdb_hml') IS NOT NULL
BEGIN
  ALTER DATABASE [salesdb_hml] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
  DROP DATABASE [salesdb_hml];
END;
GO

RESTORE DATABASE [salesdb_hml]
FROM DISK = N'/var/opt/mssql/backup/salesdb_to_salesdb_hml.bak'
WITH
  MOVE N'salesdb' TO N'/var/opt/mssql/data/salesdb_hml.mdf',
  MOVE N'salesdb_log' TO N'/var/opt/mssql/data/salesdb_hml_log.ldf',
  RECOVERY,
  STATS = 5;
GO

SELECT
  name,
  state_desc,
  recovery_model_desc
FROM sys.databases
WHERE name IN (N'salesdb', N'salesdb_hml')
ORDER BY name;
GO

SELECT
  type_desc,
  COUNT(*) AS total
FROM salesdb_hml.sys.objects
WHERE is_ms_shipped = 0
GROUP BY type_desc
ORDER BY type_desc;
GO
