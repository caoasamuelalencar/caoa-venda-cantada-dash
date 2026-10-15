-- Additive migration: supports one or more regionals per user without removing
-- the legacy User.regional column. Review and apply this migration explicitly.
CREATE TABLE [dbo].[UserRegional] (
    [userId] INT NOT NULL,
    [regional] NVARCHAR(100) NOT NULL,
    CONSTRAINT [UserRegional_pkey] PRIMARY KEY CLUSTERED ([userId], [regional]),
    CONSTRAINT [UserRegional_userId_fkey]
      FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Preserve the existing single-regional assignments as the first assignment.
INSERT INTO [dbo].[UserRegional] ([userId], [regional])
SELECT [id], LTRIM(RTRIM([regional]))
FROM [dbo].[User]
WHERE [regional] IS NOT NULL
  AND LTRIM(RTRIM([regional])) <> '';

CREATE NONCLUSTERED INDEX [UserRegional_regional_idx] ON [dbo].[UserRegional]([regional]);
