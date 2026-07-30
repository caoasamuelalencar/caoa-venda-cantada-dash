import prisma from '../lib/prisma';
import { parseOptionalYear, SalesIntention, SalesIntentionPayload } from '../entities/SalesIntention';
import { getCurrentMonthDateRange } from '../utils/dateRange';
import { buildSalesIntentionCombination } from '../utils/salesIntentionCatalog';

export class SalesIntentionRepository {
  public async findAll(dateRange = getCurrentMonthDateRange(), tipoVenda?: string) {
    return prisma.salesIntention.findMany({
      where: {
        dataSolicitacao: dateRange,
        ...(tipoVenda ? { tipoVenda } : {})
      },
      select: {
        id: true,
        proprietario: true,
        tipoVenda: true,
        bandeira: true,
        lojaVenda: true,
        marcaVeiculo: true,
        versao: true,
        classificacao: true,
        quantidade: true,
        dataSolicitacao: true,
        ano_fabricacao: true,
        ano_modelo: true,
        placa: true,
        regional: true,
        criado: true
      },
      orderBy: { criado: 'desc' }
    });
  }

  public async findById(id: number) {
    return prisma.salesIntention.findUnique({ where: { id } });
  }

  public async create(payload: SalesIntentionPayload) {
    const domainRecord = new SalesIntention(payload);
    const data = {
      proprietario: domainRecord.proprietario,
      tipoVenda: domainRecord.tipoVenda,
      bandeira: domainRecord.bandeira,
      lojaVenda: domainRecord.lojaVenda,
      marcaVeiculo: domainRecord.marcaVeiculo,
      versao: domainRecord.versao,
      classificacao: domainRecord.classificacao,
      quantidade: domainRecord.quantidade,
      dataSolicitacao: domainRecord.dataSolicitacao,
      ano_fabricacao: domainRecord.ano_fabricacao,
      ano_modelo: domainRecord.ano_modelo,
      placa: domainRecord.placa,
      regional: domainRecord.regional,
      criado: domainRecord.criado
    };
    const catalogData = buildSalesIntentionCombination(domainRecord);
    const [record] = await prisma.$transaction([
      prisma.salesIntention.create({ data }),
      prisma.salesIntentionOptionCombination.upsert({
        where: { combinationKey: catalogData.combinationKey },
        create: catalogData,
        update: {}
      })
    ]);

    return record;
  }

  public async update(id: number, payload: Partial<SalesIntentionPayload>) {
    const data = {
      ...(payload.proprietario && { proprietario: payload.proprietario }),
      ...(payload.tipoVenda && { tipoVenda: payload.tipoVenda }),
      ...(payload.bandeira && { bandeira: payload.bandeira }),
      ...(payload.lojaVenda && { lojaVenda: payload.lojaVenda }),
      ...(payload.marcaVeiculo && { marcaVeiculo: payload.marcaVeiculo }),
      ...(payload.versao && { versao: payload.versao }),
      ...(payload.classificacao && { classificacao: payload.classificacao }),
      ...(payload.quantidade !== undefined && { quantidade: Number(payload.quantidade) }),
      ...(payload.dataSolicitacao && { dataSolicitacao: SalesIntention.parseDate(payload.dataSolicitacao) }),
      ...(payload.ano_fabricacao !== undefined && {
        ano_fabricacao: parseOptionalYear(payload.ano_fabricacao)
      }),
      ...(payload.ano_modelo !== undefined && {
        ano_modelo: parseOptionalYear(payload.ano_modelo)
      }),
      ...(payload.placa && { placa: payload.placa }),
      ...(payload.regional && { regional: payload.regional }),
      ...(payload.criado && { criado: new Date(payload.criado) })
    };

    const record = await prisma.salesIntention.update({
      where: { id },
      data
    });

    if (
      record.tipoVenda &&
      record.bandeira &&
      record.regional &&
      record.lojaVenda &&
      record.marcaVeiculo &&
      record.versao &&
      record.classificacao
    ) {
      const catalogData = buildSalesIntentionCombination({
        tipoVenda: record.tipoVenda,
        bandeira: record.bandeira,
        regional: record.regional,
        lojaVenda: record.lojaVenda,
        marcaVeiculo: record.marcaVeiculo,
        versao: record.versao,
        classificacao: record.classificacao
      });

      await prisma.salesIntentionOptionCombination.upsert({
        where: { combinationKey: catalogData.combinationKey },
        create: catalogData,
        update: {}
      });
    }

    return record;
  }

  public async delete(id: number) {
    return prisma.salesIntention.delete({ where: { id } });
  }
}
