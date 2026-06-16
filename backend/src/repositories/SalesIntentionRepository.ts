import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { parseOptionalYear, SalesIntention, SalesIntentionPayload } from '../entities/SalesIntention';

export class SalesIntentionRepository {
  public async findAll() {
    return prisma.salesIntention.findMany({ orderBy: { criado: 'desc' } });
  }

  public async findById(id: number) {
    return prisma.salesIntention.findUnique({ where: { id } });
  }

  public async create(payload: SalesIntentionPayload) {
    const domainRecord = new SalesIntention(payload);
    const data: Prisma.SalesIntentionUncheckedCreateInput = {
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
    return prisma.salesIntention.create({
      data
    });
  }

  public async update(id: number, payload: Partial<SalesIntentionPayload>) {
    const data: Prisma.SalesIntentionUncheckedUpdateInput = {
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

    return prisma.salesIntention.update({
      where: { id },
      data
    });
  }

  public async delete(id: number) {
    return prisma.salesIntention.delete({ where: { id } });
  }
}
