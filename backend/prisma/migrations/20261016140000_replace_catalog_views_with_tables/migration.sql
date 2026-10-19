/*
  Homologação: os catálogos legados deixaram de ser views e passam a ser
  tabelas locais. Em bancos que já possuem as tabelas (como a origem), esta
  migration é um no-op. Os dados são sincronizados pelo script dedicado.
*/
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'[dbo].[VW_IntencaoVendas_ClassificacaoVenda]', N'V') IS NOT NULL
  DROP VIEW [dbo].[VW_IntencaoVendas_ClassificacaoVenda];

IF OBJECT_ID(N'[dbo].[VW_IntencaoVendas_Empresa]', N'V') IS NOT NULL
  DROP VIEW [dbo].[VW_IntencaoVendas_Empresa];

IF OBJECT_ID(N'[dbo].[VW_IntencaoVendas_ModelosDealer]', N'V') IS NOT NULL
  DROP VIEW [dbo].[VW_IntencaoVendas_ModelosDealer];

IF OBJECT_ID(N'[dbo].[VW_IntencaoVendas_TipoVenda]', N'V') IS NOT NULL
  DROP VIEW [dbo].[VW_IntencaoVendas_TipoVenda];

IF OBJECT_ID(N'[dbo].[VW_IntencaoVendas_ClassificacaoVenda]', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[VW_IntencaoVendas_ClassificacaoVenda] (
    [Descricao_Classificacao_Venda] VARCHAR(50) NULL
  );
END;

IF OBJECT_ID(N'[dbo].[VW_IntencaoVendas_Empresa]', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[VW_IntencaoVendas_Empresa] (
    [Empresa_MarcaDescricao] VARCHAR(50) NULL,
    [Empresa_NomeFantasia] VARCHAR(50) NULL,
    [Regional_Vendas] VARCHAR(50) NULL
  );
END;

IF OBJECT_ID(N'[dbo].[VW_IntencaoVendas_ModelosDealer]', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[VW_IntencaoVendas_ModelosDealer] (
    [Marca] VARCHAR(50) NULL,
    [Modelo] VARCHAR(50) NULL,
    [Versao_Modelo] VARCHAR(50) NULL,
    [Ano] INT NULL,
    [Placa] VARCHAR(50) NULL,
    [Tipo_Venda] VARCHAR(50) NULL
  );
END;

IF OBJECT_ID(N'[dbo].[VW_IntencaoVendas_TipoVenda]', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[VW_IntencaoVendas_TipoVenda] (
    [Descricao_TipoVenda] VARCHAR(20) NULL
  );
END;

COMMIT TRANSACTION;
