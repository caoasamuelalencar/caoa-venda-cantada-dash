import prisma from '../lib/prisma';
import { SalesIntentionCatalogRow } from '../entities/SalesIntentionCatalog';

function toIso(value: Date) {
  return value.toISOString();
}

type CatalogLikeRow = {
  id: number;
  tipoVenda: string;
  bandeira: string;
  regional: string;
  lojaVenda: string;
  marcaVeiculo: string;
  versao: string;
  classificacao: string;
  criado: Date;
  atualizado?: Date;
};

function mapCatalogRow(row: {
  id: number;
  tipoVenda: string;
  bandeira: string;
  regional: string;
  lojaVenda: string;
  marcaVeiculo: string;
  versao: string;
  classificacao: string;
  criado: Date;
  atualizado: Date;
}): SalesIntentionCatalogRow {
  return {
    id: row.id,
    Tipo_Venda: row.tipoVenda,
    Bandeira: row.bandeira,
    Regional: row.regional,
    Loja_Venda: row.lojaVenda,
    Marca_Veiculo: row.marcaVeiculo,
    Versao: row.versao,
    Classificacao: row.classificacao,
    Criado: toIso(row.criado),
    Atualizado: toIso(row.atualizado)
  };
}

function mapSalesIntentionRow(row: CatalogLikeRow): SalesIntentionCatalogRow {
  return {
    id: row.id,
    Tipo_Venda: row.tipoVenda,
    Bandeira: row.bandeira,
    Regional: row.regional,
    Loja_Venda: row.lojaVenda,
    Marca_Veiculo: row.marcaVeiculo,
    Versao: row.versao,
    Classificacao: row.classificacao,
    Criado: toIso(row.criado),
    Atualizado: toIso(row.atualizado ?? row.criado)
  };
}

function buildCatalogKey(row: SalesIntentionCatalogRow) {
  return [
    row.Tipo_Venda,
    row.Bandeira,
    row.Regional,
    row.Loja_Venda,
    row.Marca_Veiculo,
    row.Versao,
    row.Classificacao
  ]
    .map((value) => value.trim().toLowerCase())
    .join('||');
}

export class SalesIntentionCatalogRepository {
  public async findAll() {
    const [catalogRows, salesIntentionRows] = await Promise.all([
      prisma.salesIntentionCatalog.findMany({
        orderBy: [
          { tipoVenda: 'asc' },
          { bandeira: 'asc' },
          { regional: 'asc' },
          { lojaVenda: 'asc' },
          { marcaVeiculo: 'asc' },
          { versao: 'asc' },
          { classificacao: 'asc' }
        ]
      }),
      prisma.salesIntention.findMany({
        select: {
          id: true,
          tipoVenda: true,
          bandeira: true,
          regional: true,
          lojaVenda: true,
          marcaVeiculo: true,
          versao: true,
          classificacao: true,
          criado: true
        },
        orderBy: [
          { tipoVenda: 'asc' },
          { bandeira: 'asc' },
          { regional: 'asc' },
          { lojaVenda: 'asc' },
          { marcaVeiculo: 'asc' },
          { versao: 'asc' },
          { classificacao: 'asc' }
        ]
      })
    ]);

    const mergedRows = [
      ...catalogRows.map(mapCatalogRow),
      ...salesIntentionRows.map(mapSalesIntentionRow)
    ];
    const uniqueRows = Array.from(
      new Map(mergedRows.map((row) => [buildCatalogKey(row), row])).values()
    );

    return uniqueRows.sort((left, right) =>
      [
        left.Tipo_Venda.localeCompare(right.Tipo_Venda),
        left.Bandeira.localeCompare(right.Bandeira),
        left.Regional.localeCompare(right.Regional),
        left.Loja_Venda.localeCompare(right.Loja_Venda),
        left.Marca_Veiculo.localeCompare(right.Marca_Veiculo),
        left.Versao.localeCompare(right.Versao),
        left.Classificacao.localeCompare(right.Classificacao)
      ].find((result) => result !== 0) ?? 0
    );
  }
}
