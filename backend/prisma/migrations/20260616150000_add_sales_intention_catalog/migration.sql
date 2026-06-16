CREATE TABLE IF NOT EXISTS "SalesIntentionCatalog" (
  "id" SERIAL NOT NULL,
  "tipoVenda" TEXT NOT NULL,
  "bandeira" TEXT NOT NULL,
  "regional" TEXT NOT NULL,
  "lojaVenda" TEXT NOT NULL,
  "marcaVeiculo" TEXT NOT NULL,
  "versao" TEXT NOT NULL,
  "classificacao" TEXT NOT NULL,
  "criado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "atualizado" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesIntentionCatalog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SalesIntentionCatalog_tipoVenda_bandeira_regional_lojaVenda_marcaVeiculo_versao_classificacao_key"
  ON "SalesIntentionCatalog"("tipoVenda", "bandeira", "regional", "lojaVenda", "marcaVeiculo", "versao", "classificacao");

CREATE INDEX IF NOT EXISTS "SalesIntentionCatalog_tipoVenda_idx" ON "SalesIntentionCatalog"("tipoVenda");
CREATE INDEX IF NOT EXISTS "SalesIntentionCatalog_bandeira_idx" ON "SalesIntentionCatalog"("bandeira");
CREATE INDEX IF NOT EXISTS "SalesIntentionCatalog_regional_idx" ON "SalesIntentionCatalog"("regional");
CREATE INDEX IF NOT EXISTS "SalesIntentionCatalog_marcaVeiculo_idx" ON "SalesIntentionCatalog"("marcaVeiculo");
