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
  placa: string;
  regional: string;
  criado?: string;
};

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
