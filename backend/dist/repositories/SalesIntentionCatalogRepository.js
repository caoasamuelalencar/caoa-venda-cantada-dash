"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesIntentionCatalogRepository = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
function toIso(value) {
    return value.toISOString();
}
function mapCatalogRow(row) {
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
function mapSalesIntentionRow(row) {
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
function buildCatalogKey(row) {
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
class SalesIntentionCatalogRepository {
    async findAll() {
        const [catalogRows, salesIntentionRows] = await Promise.all([
            prisma_1.default.salesIntentionCatalog.findMany({
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
            prisma_1.default.salesIntention.findMany({
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
        const uniqueRows = Array.from(new Map(mergedRows.map((row) => [buildCatalogKey(row), row])).values());
        return uniqueRows.sort((left, right) => [
            left.Tipo_Venda.localeCompare(right.Tipo_Venda),
            left.Bandeira.localeCompare(right.Bandeira),
            left.Regional.localeCompare(right.Regional),
            left.Loja_Venda.localeCompare(right.Loja_Venda),
            left.Marca_Veiculo.localeCompare(right.Marca_Veiculo),
            left.Versao.localeCompare(right.Versao),
            left.Classificacao.localeCompare(right.Classificacao)
        ].find((result) => result !== 0) ?? 0);
    }
}
exports.SalesIntentionCatalogRepository = SalesIntentionCatalogRepository;
