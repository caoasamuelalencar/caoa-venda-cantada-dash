import prisma from '../lib/prisma';
import { SalesIntention, SalesIntentionPayload } from '../entities/SalesIntention';

export class SalesIntentionRepository {
  public async findAll() {
    return prisma.salesIntention.findMany({ orderBy: { criado: 'desc' } });
  }

  public async findById(id: number) {
    return prisma.salesIntention.findUnique({ where: { id } });
  }

  public async create(payload: SalesIntentionPayload) {
    const domainRecord = new SalesIntention(payload);
    return prisma.salesIntention.create({
      data: {
        proprietario: domainRecord.proprietario,
        tipoVenda: domainRecord.tipoVenda,
        bandeira: domainRecord.bandeira,
        lojaVenda: domainRecord.lojaVenda,
        marcaVeiculo: domainRecord.marcaVeiculo,
        versao: domainRecord.versao,
        classificacao: domainRecord.classificacao,
        quantidade: domainRecord.quantidade,
        dataSolicitacao: domainRecord.dataSolicitacao,
        placa: domainRecord.placa,
        regional: domainRecord.regional,
        criado: domainRecord.criado
      }
    });
  }

  public async update(id: number, payload: Partial<SalesIntentionPayload>) {
    return prisma.salesIntention.update({
      where: { id },
      data: {
        ...(payload.proprietario && { proprietario: payload.proprietario }),
        ...(payload.tipoVenda && { tipoVenda: payload.tipoVenda }),
        ...(payload.bandeira && { bandeira: payload.bandeira }),
        ...(payload.lojaVenda && { lojaVenda: payload.lojaVenda }),
        ...(payload.marcaVeiculo && { marcaVeiculo: payload.marcaVeiculo }),
        ...(payload.versao && { versao: payload.versao }),
        ...(payload.classificacao && { classificacao: payload.classificacao }),
        ...(payload.quantidade !== undefined && { quantidade: Number(payload.quantidade) }),
        ...(payload.dataSolicitacao && { dataSolicitacao: SalesIntention.parseDate(payload.dataSolicitacao) }),
        ...(payload.placa && { placa: payload.placa }),
        ...(payload.regional && { regional: payload.regional }),
        ...(payload.criado && { criado: new Date(payload.criado) })
      }
    });
  }

  public async delete(id: number) {
    return prisma.salesIntention.delete({ where: { id } });
  }
}
