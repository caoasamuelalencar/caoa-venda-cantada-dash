export type SalesIntentionPayload = {
  proprietario: string;
  tipoVenda: string;
  bandeira: string;
  lojaVenda: string;
  marcaVeiculo: string;
  versao: string;
  classificacao: string;
  quantidade: number;
  dataSolicitacao: string;
  ano_fabricacao?: string | number | null;
  ano_modelo?: string | number | null;
  placa: string;
  regional: string;
  criado?: string;
};

export function parseOptionalYear(value?: string | number | null): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error('Os campos ano_fabricacao e ano_modelo precisam ser anos válidos.');
  }

  return parsed;
}

export class SalesIntention {
  public readonly id: number | null;
  public readonly proprietario: string;
  public readonly tipoVenda: string;
  public readonly bandeira: string;
  public readonly lojaVenda: string;
  public readonly marcaVeiculo: string;
  public readonly versao: string;
  public readonly classificacao: string;
  public readonly quantidade: number;
  public readonly dataSolicitacao: Date;
  public readonly ano_fabricacao: number | null;
  public readonly ano_modelo: number | null;
  public readonly placa: string;
  public readonly regional: string;
  public readonly criado: Date;

  constructor(payload: SalesIntentionPayload, id: number | null = null) {
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

  public static parseDate(value: string): Date {
    const [day, month, year] = value.split('/').map(Number);
    if (!day || !month || !year) {
      throw new Error('dataSolicitacao precisa estar no formato DD/MM/YYYY');
    }
    return new Date(year, month - 1, day);
  }
}
