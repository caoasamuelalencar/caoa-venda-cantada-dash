CREATE TABLE [dbo].[Screen] (
    [id] INT NOT NULL IDENTITY(1,1),
    [code] VARCHAR(50) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [path] VARCHAR(255) NOT NULL,
    [sortOrder] INT NOT NULL CONSTRAINT [Screen_sortOrder_df] DEFAULT 0,
    CONSTRAINT [Screen_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Screen_code_key] UNIQUE NONCLUSTERED ([code])
);

CREATE TABLE [dbo].[UserScreen] (
    [userId] INT NOT NULL,
    [screenId] INT NOT NULL,
    CONSTRAINT [UserScreen_pkey] PRIMARY KEY CLUSTERED ([userId], [screenId]),
    CONSTRAINT [UserScreen_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE,
    CONSTRAINT [UserScreen_screenId_fkey] FOREIGN KEY ([screenId]) REFERENCES [dbo].[Screen]([id]) ON DELETE CASCADE
);

CREATE NONCLUSTERED INDEX [UserScreen_screenId_idx] ON [dbo].[UserScreen]([screenId]);

INSERT INTO [dbo].[Screen] ([code], [name], [path], [sortOrder]) VALUES
  ('SALES_INTENTION', N'Intenções de venda', '/sales-intention', 10),
  ('DASHBOARD', N'Dashboard', '/dashboard', 20),
  ('REPORT_BRAND', N'Relatório por marca', '/relatorios/marca', 30),
  ('REPORT_SELLER', N'Relatório por vendedor', '/relatorios/vendedor', 40),
  ('PROFILE', N'Perfil', '/perfil', 50),
  ('ACCESS_MANAGEMENT', N'Gestão de acessos', '/admin/access-management', 60);

-- Preserve the current experience for existing users. New users are configured
-- individually by an administrator after their first sign-in.
INSERT INTO [dbo].[UserScreen] ([userId], [screenId])
SELECT [User].[id], [Screen].[id]
FROM [dbo].[User] CROSS JOIN [dbo].[Screen];
