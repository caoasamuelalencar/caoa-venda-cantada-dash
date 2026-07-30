import { createHash } from 'crypto';

export type SalesIntentionCombination = {
  tipoVenda: string;
  bandeira: string;
  regional: string;
  lojaVenda: string;
  marcaVeiculo: string;
  versao: string;
  classificacao: string;
};

export function buildSalesIntentionCombination(values: SalesIntentionCombination) {
  const combination = {
    tipoVenda: values.tipoVenda.trim(),
    bandeira: values.bandeira.trim(),
    regional: values.regional.trim(),
    lojaVenda: values.lojaVenda.trim(),
    marcaVeiculo: values.marcaVeiculo.trim(),
    versao: values.versao.trim(),
    classificacao: values.classificacao.trim()
  };
  const normalizedKey = Object.values(combination)
    .map((value) => value.toLowerCase())
    .join('||');

  return {
    ...combination,
    combinationKey: createHash('sha256')
      .update(Buffer.from(normalizedKey, 'utf16le'))
      .digest('hex')
      .toUpperCase()
  };
}
