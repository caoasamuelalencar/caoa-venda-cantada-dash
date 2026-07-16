"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesIntentionRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const SalesIntention_1 = require("../entities/SalesIntention");
class SalesIntentionRepository {
    async findAll() {
        return prisma_1.default.salesIntention.findMany({ orderBy: { criado: 'desc' } });
    }
    async findById(id) {
        return prisma_1.default.salesIntention.findUnique({ where: { id } });
    }
    async create(payload) {
        const domainRecord = new SalesIntention_1.SalesIntention(payload);
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
        return prisma_1.default.salesIntention.create({
            data
        });
    }
    async update(id, payload) {
        const data = {
            ...(payload.proprietario && { proprietario: payload.proprietario }),
            ...(payload.tipoVenda && { tipoVenda: payload.tipoVenda }),
            ...(payload.bandeira && { bandeira: payload.bandeira }),
            ...(payload.lojaVenda && { lojaVenda: payload.lojaVenda }),
            ...(payload.marcaVeiculo && { marcaVeiculo: payload.marcaVeiculo }),
            ...(payload.versao && { versao: payload.versao }),
            ...(payload.classificacao && { classificacao: payload.classificacao }),
            ...(payload.quantidade !== undefined && { quantidade: Number(payload.quantidade) }),
            ...(payload.dataSolicitacao && { dataSolicitacao: SalesIntention_1.SalesIntention.parseDate(payload.dataSolicitacao) }),
            ...(payload.ano_fabricacao !== undefined && {
                ano_fabricacao: (0, SalesIntention_1.parseOptionalYear)(payload.ano_fabricacao)
            }),
            ...(payload.ano_modelo !== undefined && {
                ano_modelo: (0, SalesIntention_1.parseOptionalYear)(payload.ano_modelo)
            }),
            ...(payload.placa && { placa: payload.placa }),
            ...(payload.regional && { regional: payload.regional }),
            ...(payload.criado && { criado: new Date(payload.criado) })
        };
        return prisma_1.default.salesIntention.update({
            where: { id },
            data
        });
    }
    async delete(id) {
        return prisma_1.default.salesIntention.delete({ where: { id } });
    }
}
exports.SalesIntentionRepository = SalesIntentionRepository;
