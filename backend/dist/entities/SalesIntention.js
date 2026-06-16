"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesIntention = void 0;
exports.parseOptionalYear = parseOptionalYear;
function parseOptionalYear(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed)) {
        throw new Error('Os campos ano_fabricacao e ano_modelo precisam ser anos válidos.');
    }
    return parsed;
}
class SalesIntention {
    constructor(payload, id = null) {
        this.id = id;
        this.proprietario = payload.proprietario.trim();
        this.tipoVenda = payload.tipoVenda.trim();
        this.bandeira = payload.bandeira.trim();
        this.lojaVenda = payload.lojaVenda.trim();
        this.marcaVeiculo = payload.marcaVeiculo.trim();
        this.versao = payload.versao.trim();
        this.classificacao = payload.classificacao.trim();
        this.quantidade = Number(payload.quantidade);
        this.dataSolicitacao = SalesIntention.parseDate(payload.dataSolicitacao);
        this.ano_fabricacao = parseOptionalYear(payload.ano_fabricacao);
        this.ano_modelo = parseOptionalYear(payload.ano_modelo);
        this.placa = payload.placa.trim();
        this.regional = payload.regional.trim();
        this.criado = payload.criado ? new Date(payload.criado) : new Date();
    }
    static parseDate(value) {
        const [day, month, year] = value.split('/').map(Number);
        if (!day || !month || !year) {
            throw new Error('dataSolicitacao precisa estar no formato DD/MM/YYYY');
        }
        return new Date(year, month - 1, day);
    }
}
exports.SalesIntention = SalesIntention;
