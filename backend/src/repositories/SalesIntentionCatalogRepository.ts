import prisma from '../lib/prisma';
import { SalesIntentionCatalogRow } from '../entities/SalesIntentionCatalog';

function compare(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

export class SalesIntentionCatalogRepository {
  public async findAll(): Promise<SalesIntentionCatalogRow[]> {
    const rows = await prisma.salesIntentionOptionCombination.findMany({
      select: {
        tipoVenda: true,
        bandeira: true,
        regional: true,
        lojaVenda: true,
        marcaVeiculo: true,
        versao: true,
        classificacao: true
      }
    });

    return rows
      .map((row) => ({
        Tipo_Venda: row.tipoVenda,
        Bandeira: row.bandeira,
        Regional: row.regional,
        Loja_Venda: row.lojaVenda,
        Marca_Veiculo: row.marcaVeiculo,
        Versao: row.versao,
        Classificacao: row.classificacao
      }))
      .sort(
        (a, b) =>
          compare(a.Tipo_Venda, b.Tipo_Venda) ||
          compare(a.Bandeira, b.Bandeira) ||
          compare(a.Regional, b.Regional) ||
          compare(a.Loja_Venda, b.Loja_Venda) ||
          compare(a.Marca_Veiculo, b.Marca_Veiculo) ||
          compare(a.Versao, b.Versao) ||
          compare(a.Classificacao, b.Classificacao)
      );
  }
}
