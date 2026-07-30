CREATE TABLE [dbo].[SalesIntentionOptionCombination] (
    [id] INT NOT NULL IDENTITY(1,1),
    [combinationKey] VARCHAR(64) NOT NULL,
    [tipoVenda] NVARCHAR(30) NOT NULL,
    [bandeira] NVARCHAR(100) NOT NULL,
    [regional] NVARCHAR(100) NOT NULL,
    [lojaVenda] NVARCHAR(200) NOT NULL,
    [marcaVeiculo] NVARCHAR(100) NOT NULL,
    [versao] NVARCHAR(200) NOT NULL,
    [classificacao] NVARCHAR(100) NOT NULL,
    [criado] DATETIME2 NOT NULL CONSTRAINT [SalesIntentionOptionCombination_criado_df] DEFAULT CURRENT_TIMESTAMP,
    [atualizado] DATETIME2 NOT NULL CONSTRAINT [SalesIntentionOptionCombination_atualizado_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [SalesIntentionOptionCombination_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [SalesIntentionOptionCombination_combinationKey_key] UNIQUE NONCLUSTERED ([combinationKey])
);

CREATE NONCLUSTERED INDEX [SalesIntentionOptionCombination_tipoVenda_bandeira_regional_idx]
ON [dbo].[SalesIntentionOptionCombination]([tipoVenda], [bandeira], [regional]);

WITH [AvailableCombinations] AS (
    SELECT DISTINCT
        LTRIM(RTRIM([tipoVenda])) AS [tipoVenda],
        LTRIM(RTRIM([bandeira])) AS [bandeira],
        LTRIM(RTRIM([regional])) AS [regional],
        LTRIM(RTRIM([lojaVenda])) AS [lojaVenda],
        LTRIM(RTRIM([marcaVeiculo])) AS [marcaVeiculo],
        LTRIM(RTRIM([versao])) AS [versao],
        LTRIM(RTRIM([classificacao])) AS [classificacao]
    FROM [dbo].[SalesIntentionCatalog]
    WHERE
        NULLIF(LTRIM(RTRIM([tipoVenda])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([bandeira])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([regional])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([lojaVenda])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([marcaVeiculo])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([versao])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([classificacao])), '') IS NOT NULL

    UNION

    SELECT DISTINCT
        LTRIM(RTRIM([tipoVenda])),
        LTRIM(RTRIM([bandeira])),
        LTRIM(RTRIM([regional])),
        LTRIM(RTRIM([lojaVenda])),
        LTRIM(RTRIM([marcaVeiculo])),
        LTRIM(RTRIM([versao])),
        LTRIM(RTRIM([classificacao]))
    FROM [dbo].[SalesIntention]
    WHERE
        NULLIF(LTRIM(RTRIM([tipoVenda])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([bandeira])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([regional])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([lojaVenda])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([marcaVeiculo])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([versao])), '') IS NOT NULL
        AND NULLIF(LTRIM(RTRIM([classificacao])), '') IS NOT NULL
)
INSERT INTO [dbo].[SalesIntentionOptionCombination] (
    [combinationKey],
    [tipoVenda],
    [bandeira],
    [regional],
    [lojaVenda],
    [marcaVeiculo],
    [versao],
    [classificacao]
)
SELECT
    CONVERT(
        VARCHAR(64),
        HASHBYTES(
            'SHA2_256',
            LOWER(
                CONCAT(
                    [tipoVenda], '||',
                    [bandeira], '||',
                    [regional], '||',
                    [lojaVenda], '||',
                    [marcaVeiculo], '||',
                    [versao], '||',
                    [classificacao]
                )
            )
        ),
        2
    ),
    [tipoVenda],
    [bandeira],
    [regional],
    [lojaVenda],
    [marcaVeiculo],
    [versao],
    [classificacao]
FROM [AvailableCombinations];
