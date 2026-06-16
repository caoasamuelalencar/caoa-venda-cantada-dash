export type SalesIntentionSeedRow = {
  proprietario: string;
  tipoVenda: string;
  bandeira: string;
  lojaVenda: string;
  marcaVeiculo: string;
  versao: string;
  classificacao: string;
  quantidade: number;
  dataSolicitacao: Date;
  placa: string;
  regional: string;
  criado: Date;
};

function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day);
}

export const salesIntentionSeedRows: SalesIntentionSeedRow[] = [
  {
    proprietario: 'hermano.batinga@caoa.com.br',
    tipoVenda: 'NOVOS',
    bandeira: 'CAOA Chery',
    lojaVenda: 'D21-7300-JOAO PESSOA',
    marcaVeiculo: 'CAOA Chery',
    versao: 'TIGGO 5X SPORT',
    classificacao: 'PCD',
    quantidade: 1,
    dataSolicitacao: parseDate('04/06/2025'),
    placa: 'AAA1B12',
    regional: 'CY5',
    criado: new Date('2025-06-04T18:06:00Z')
  },
  {
    proprietario: 'evaristo.rafael@caoa.com.br',
    tipoVenda: 'NOVOS',
    bandeira: 'CAOA Chery',
    lojaVenda: 'D21-2333-PARALELA',
    marcaVeiculo: 'CAOA Chery',
    versao: 'TIGGO 7 SPORT',
    classificacao: 'Varejo',
    quantidade: 1,
    dataSolicitacao: parseDate('04/06/2025'),
    placa: 'AAA1B12',
    regional: 'CY5',
    criado: new Date('2025-06-04T18:06:00Z')
  }
];
