import { describe, expect, it } from "vitest";
import { SalesIntention, parseOptionalYear } from "./SalesIntention";

const payload = {
  proprietario: " Ana ", tipoVenda: " NOVOS ", bandeira: "CAOA CHERY", lojaVenda: "Loja A",
  marcaVeiculo: "Tiggo", versao: "Pro", classificacao: "Venda", quantidade: 2,
  dataSolicitacao: "15/02/2026 10:30", placa: "ABC1D23", regional: "SP",
};

describe("SalesIntention", () => {
  it("normaliza campos, anos opcionais e data válida", () => {
    const record = new SalesIntention({ ...payload, ano_fabricacao: "2025", ano_modelo: null });
    expect(record.proprietario).toBe("Ana");
    expect(record.quantidade).toBe(2);
    expect(record.ano_fabricacao).toBe(2025);
    expect(record.ano_modelo).toBeNull();
  });

  it("rejeita quantidade, ano e data inválidos", () => {
    expect(() => new SalesIntention({ ...payload, quantidade: 0 })).toThrow("quantidade precisa ser um inteiro positivo");
    expect(() => parseOptionalYear("zero")).toThrow("anos válidos");
    expect(() => new SalesIntention({ ...payload, dataSolicitacao: "31/02/2026" })).toThrow("data e hora válidas");
  });
});
