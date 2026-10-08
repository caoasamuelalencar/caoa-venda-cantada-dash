CREATE TABLE [dbo].[StoreFlow] (
    [id] INT NOT NULL IDENTITY(1,1),
    [regional] NVARCHAR(100) NOT NULL,
    [lojaVenda] NVARCHAR(200) NOT NULL,
    [fluxo] INT NOT NULL,
    [data] DATETIME2 NOT NULL,
    [createdByUserId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [StoreFlow_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [StoreFlow_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [StoreFlow_data_regional_lojaVenda_key] UNIQUE NONCLUSTERED ([data], [regional], [lojaVenda]),
    CONSTRAINT [StoreFlow_createdByUserId_fkey] FOREIGN KEY ([createdByUserId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE NONCLUSTERED INDEX [StoreFlow_regional_lojaVenda_data_idx] ON [dbo].[StoreFlow]([regional], [lojaVenda], [data]);
CREATE NONCLUSTERED INDEX [StoreFlow_createdByUserId_idx] ON [dbo].[StoreFlow]([createdByUserId]);

INSERT INTO [dbo].[Screen] ([code], [name], [path], [sortOrder])
VALUES ('STORE_FLOW', N'Fluxo de loja', '/fluxo-loja', 15);

-- The former external form was available to every user. Preserve this behavior
-- while allowing administrators to adjust the access later through UserScreen.
INSERT INTO [dbo].[UserScreen] ([userId], [screenId])
SELECT [User].[id], [Screen].[id]
FROM [dbo].[User]
CROSS JOIN [dbo].[Screen]
WHERE [Screen].[code] = 'STORE_FLOW';
