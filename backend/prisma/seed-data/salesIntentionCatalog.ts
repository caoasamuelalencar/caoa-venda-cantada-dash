export type SalesIntentionCatalogSeedRow = {
  tipoVenda: string;
  bandeira: string;
  regional: string;
  lojaVenda: string;
  marcaVeiculo: string;
  versao: string;
  classificacao: string;
};

export const salesIntentionCatalogSeedRows: SalesIntentionCatalogSeedRow[] = [
  {
    tipoVenda: 'NOVOS',
    bandeira: 'CAOA Chery',
    regional: 'CY1',
    lojaVenda: 'D21-1019-VILA GUILHERME',
    marcaVeiculo: 'CAOA Chery',
    versao: 'TIGGO 5X SPORT',
    classificacao: 'Varejo'
  },
  {
    tipoVenda: 'NOVOS',
    bandeira: 'CAOA Chery',
    regional: 'CY2',
    lojaVenda: 'D21-0713-RIBEIRAO PRETO',
    marcaVeiculo: 'CAOA Chery',
    versao: 'TIGGO 7 SPORT',
    classificacao: 'Varejo'
  },
  {
    tipoVenda: 'NOVOS',
    bandeira: 'HYUNDAI',
    regional: 'CY3',
    lojaVenda: 'D21-2414-IMBIRIBEIRA',
    marcaVeiculo: 'HYUNDAI',
    versao: 'HB20 HATCH',
    classificacao: 'PCD'
  },
  {
    tipoVenda: 'NOVOS',
    bandeira: 'CAOA Changan',
    regional: 'A definir',
    lojaVenda: 'A definir',
    marcaVeiculo: 'CAOA Changan',
    versao: 'A definir',
    classificacao: 'Varejo'
  },
  {
    tipoVenda: 'SEMINOVOS',
    bandeira: 'CAOA Chery',
    regional: 'CY4',
    lojaVenda: 'D21-3739-S.I.A',
    marcaVeiculo: 'CAOA Chery',
    versao: 'TIGGO 8 MAX DRIVE',
    classificacao: 'Atacado'
  },
  {
    tipoVenda: 'SEMINOVOS',
    bandeira: 'HYUNDAI',
    regional: 'CY5',
    lojaVenda: 'D21-7300-JOAO PESSOA',
    marcaVeiculo: 'HYUNDAI',
    versao: 'CRETA',
    classificacao: 'Varejo'
  }
];
