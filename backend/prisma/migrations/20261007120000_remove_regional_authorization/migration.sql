-- Remove regional assignments and data scopes from authorization. Regional data
-- remains on sales intentions and their catalogs for business filtering.
IF OBJECT_ID(N'[dbo].[UserRegional]', N'U') IS NOT NULL
BEGIN
    DROP TABLE [dbo].[UserRegional];
END;

IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'User_regional_idx' AND object_id = OBJECT_ID(N'[dbo].[User]')
)
BEGIN
    DROP INDEX [User_regional_idx] ON [dbo].[User];
END;

IF COL_LENGTH(N'[dbo].[User]', N'regional') IS NOT NULL
BEGIN
    ALTER TABLE [dbo].[User] DROP COLUMN [regional];
END;

IF COL_LENGTH(N'[dbo].[Role]', N'dataScope') IS NOT NULL
BEGIN
    ALTER TABLE [dbo].[Role] DROP COLUMN [dataScope];
END;
