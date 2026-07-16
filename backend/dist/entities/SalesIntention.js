"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesIntention = void 0;
exports.parseOptionalYear = parseOptionalYear;
const AppError_1 = require("../errors/AppError");
function parseOptionalYear(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw (0, AppError_1.badRequest)('Os campos ano_fabricacao e ano_modelo precisam ser anos válidos.');
    }
    return parsed;
}
function parseQuantity(value) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw (0, AppError_1.badRequest)('quantidade precisa ser um inteiro positivo.');
    }
    return parsed;
}
function isValidDate(value) {
    return !Number.isNaN(value.getTime());
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
        this.quantidade = parseQuantity(payload.quantidade);
        this.dataSolicitacao = SalesIntention.parseDate(payload.dataSolicitacao);
        this.ano_fabricacao = parseOptionalYear(payload.ano_fabricacao);
        this.ano_modelo = parseOptionalYear(payload.ano_modelo);
        this.placa = payload.placa.trim();
        this.regional = payload.regional.trim();
        this.criado = payload.criado ? new Date(payload.criado) : new Date();
        if (!isValidDate(this.criado)) {
            throw (0, AppError_1.badRequest)('criado precisa ser uma data válida.');
        }
    }
    static parseDate(value) {
        const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
        if (!match) {
            throw (0, AppError_1.badRequest)('dataSolicitacao precisa estar no formato DD/MM/YYYY');
        }
        const [, dayText, monthText, yearText] = match;
        const day = Number(dayText);
        const month = Number(monthText);
        const year = Number(yearText);
        const parsedDate = new Date(year, month - 1, day);
        if (parsedDate.getFullYear() !== year ||
            parsedDate.getMonth() !== month - 1 ||
            parsedDate.getDate() !== day) {
            throw (0, AppError_1.badRequest)('dataSolicitacao precisa ser uma data válida.');
        }
        return parsedDate;
    }
}
exports.SalesIntention = SalesIntention;
