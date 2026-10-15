-- Additive migration only. It deliberately preserves all existing production data.
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [entraObjectId] NVARCHAR(64) NOT NULL,
    [tenantId] NVARCHAR(64) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [email] NVARCHAR(320),
    [department] NVARCHAR(255),
    [jobTitle] NVARCHAR(255),
    [regional] NVARCHAR(100),
    [active] BIT NOT NULL CONSTRAINT [User_active_df] DEFAULT 1,
    [lastLoginAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL CONSTRAINT [User_updatedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_tenantId_entraObjectId_key] UNIQUE NONCLUSTERED ([tenantId], [entraObjectId])
);

CREATE TABLE [dbo].[Role] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] VARCHAR(50) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [dataScope] VARCHAR(20) NOT NULL,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Role_code_key] UNIQUE NONCLUSTERED ([code])
);

CREATE TABLE [dbo].[Permission] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] VARCHAR(50) NOT NULL,
    [name] NVARCHAR(150) NOT NULL,
    CONSTRAINT [Permission_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Permission_code_key] UNIQUE NONCLUSTERED ([code])
);

CREATE TABLE [dbo].[UserRole] (
    [userId] INT NOT NULL,
    [roleId] INT NOT NULL,
    CONSTRAINT [UserRole_pkey] PRIMARY KEY CLUSTERED ([userId], [roleId]),
    CONSTRAINT [UserRole_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE,
    CONSTRAINT [UserRole_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE CASCADE
);

CREATE TABLE [dbo].[RolePermission] (
    [roleId] INT NOT NULL,
    [permissionId] INT NOT NULL,
    CONSTRAINT [RolePermission_pkey] PRIMARY KEY CLUSTERED ([roleId], [permissionId]),
    CONSTRAINT [RolePermission_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE CASCADE,
    CONSTRAINT [RolePermission_permissionId_fkey] FOREIGN KEY ([permissionId]) REFERENCES [dbo].[Permission]([id]) ON DELETE CASCADE
);

ALTER TABLE [dbo].[SalesIntention] ADD [createdByUserId] INT NULL;
ALTER TABLE [dbo].[SalesIntention] ADD CONSTRAINT [SalesIntention_createdByUserId_fkey]
  FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

CREATE NONCLUSTERED INDEX [User_regional_idx] ON [dbo].[User]([regional]);
CREATE NONCLUSTERED INDEX [User_active_idx] ON [dbo].[User]([active]);
CREATE NONCLUSTERED INDEX [UserRole_roleId_idx] ON [dbo].[UserRole]([roleId]);
CREATE NONCLUSTERED INDEX [RolePermission_permissionId_idx] ON [dbo].[RolePermission]([permissionId]);
CREATE NONCLUSTERED INDEX [SalesIntention_createdByUserId_idx] ON [dbo].[SalesIntention]([createdByUserId]);
CREATE NONCLUSTERED INDEX [SalesIntention_regional_dataSolicitacao_idx]
  ON [dbo].[SalesIntention]([regional], [dataSolicitacao]);
