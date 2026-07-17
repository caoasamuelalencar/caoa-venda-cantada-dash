import prisma from '../lib/prisma';
import { SalesIntentionCatalogRow } from '../entities/SalesIntentionCatalog';

function toIso(value?: Date | null): string {
  return value ? value.toISOString() : '';
}

type CatalogLikeRow = {
  id: number;
  tipoVenda: string | null;
  bandeira: string | null;
  regional: string | null;
  lojaVenda: string | null;
  marcaVeiculo: string | null;
  versao: string | null;
  classificacao: string | null;
  criado: Date | null;
  atualizado?: Date | null;
};

function safeString(value: unknown): string {
  return String(value ?? '').trim();
}

function normalize(value: unknown): string {
  return safeString(value).toLowerCase();
}

function mapCatalogRow(row: CatalogLikeRow): SalesIntentionCatalogRow {
  return {
    id: row.id,
    Tipo_Venda: safeString(row.tipoVenda),
    Bandeira: safeString(row.bandeira),
    Regional: safeString(row.regional),
    Loja_Venda: safeString(row.lojaVenda),
    Marca_Veiculo: safeString(row.marcaVeiculo),
    Versao: safeString(row.versao),
    Classificacao: safeString(row.classificacao),
    Criado: toIso(row.criado),
    Atualizado: toIso(row.atualizado ?? row.criado),
  };
}

function mapSalesIntentionRow(row: CatalogLikeRow): SalesIntentionCatalogRow {
  return {
    id: row.id,
    Tipo_Venda: safeString(row.tipoVenda),
    Bandeira: safeString(row.bandeira),
    Regional: safeString(row.regional),
    Loja_Venda: safeString(row.lojaVenda),
    Marca_Veiculo: safeString(row.marcaVeiculo),
    Versao: safeString(row.versao),
    Classificacao: safeString(row.classificacao),
    Criado: toIso(row.criado),
    Atualizado: toIso(row.atualizado ?? row.criado),
  };
}

function buildCatalogKey(row: SalesIntentionCatalogRow): string {
  return [
    row.Tipo_Venda,
    row.Bandeira,
    row.Regional,
    row.Loja_Venda,
    row.Marca_Veiculo,
    row.Versao,
    row.Classificacao,
  ]
    .map(normalize)
    .join('||');
}

function compare(a?: string | null, b?: string | null): number {
  return safeString(a).localeCompare(safeString(b), 'pt-BR', {
    sensitivity: 'base',
  });
}

export class SalesIntentionCatalogRepository {
  public async findAll(): Promise<SalesIntentionCatalogRow[]> {
    const [catalogRows, salesIntentionRows] = await Promise.all([
      prisma.salesIntentionCatalog.findMany({
        orderBy: [
          { tipoVenda: 'asc' },
          { bandeira: 'asc' },
          { regional: 'asc' },
          { lojaVenda: 'asc' },
          { marcaVeiculo: 'asc' },
          { versao: 'asc' },
          { classificacao: 'asc' },
        ],
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
          criado: true,
        },
        orderBy: [
          { tipoVenda: 'asc' },
          { bandeira: 'asc' },
          { regional: 'asc' },
          { lojaVenda: 'asc' },
          { marcaVeiculo: 'asc' },
          { versao: 'asc' },
          { classificacao: 'asc' },
        ],
      }),
    ]);

    const mergedRows = [
      ...catalogRows.map(mapCatalogRow),
      ...salesIntentionRows.map(mapSalesIntentionRow),
    ];

    const uniqueRows = Array.from(
      new Map(
        mergedRows.map((row) => [buildCatalogKey(row), row])
      ).values()
    );

    return uniqueRows.sort((a, b) => {
      return (
        compare(a.Tipo_Venda, b.Tipo_Venda) ||
        compare(a.Bandeira, b.Bandeira) ||
        compare(a.Regional, b.Regional) ||
        compare(a.Loja_Venda, b.Loja_Venda) ||
        compare(a.Marca_Veiculo, b.Marca_Veiculo) ||
        compare(a.Versao, b.Versao) ||
        compare(a.Classificacao, b.Classificacao)
      );
    });
  }
}