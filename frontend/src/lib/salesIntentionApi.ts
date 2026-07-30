import type { SalesIntentionPayload } from '@/types/types';

export type SalesIntentionApiRecord = {
  id: number;
  proprietario: string;
  tipoVenda: string;
  bandeira: string;
  lojaVenda: string;
  marcaVeiculo: string;
  versao: string;
  classificacao: string;
  quantidade: number;
  dataSolicitacao: string;
  ano_fabricacao?: number | null;
  ano_modelo?: number | null;
  placa: string;
  regional: string;
  criado: string;
};

export type SalesIntentionReportRow = {
  ID: number;
  Proprietario: string;
  Tipo_Venda: string;
  Bandeira: string;
  Loja_Venda: string;
  Marca_Veiculo: string;
  Versao: string;
  Classificacao: string;
  Quantidade: string;
  Data_solicitacao: string;
  Placa: string;
  Regional: string;
  Criado: string;
};

export type SalesIntentionCatalogRecord = {
  Tipo_Venda: string;
  Bandeira: string;
  Regional: string;
  Loja_Venda: string;
  Marca_Veiculo: string;
  Versao: string;
  Classificacao: string;
};

type CompactSalesIntentionCatalog = {
  version: 1;
  dictionaries: string[][];
  combinations: number[][];
};

function toDate(value: string | Date): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value;
  }

  const maybeDate = new Date(value);
  if (!Number.isNaN(maybeDate.getTime())) {
    return maybeDate;
  }

  const [day, month, year] = value.split('/').map(Number);
  if (!day || !month || !year) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function formatDate(value: string | Date): string {
  const date = toDate(value);
  if (!date) return String(value);
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function formatDateTime(value: string | Date): string {
  const date = toDate(value);
  if (!date) return String(value);
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function transformApiRecord(record: SalesIntentionApiRecord): SalesIntentionReportRow {
  return {
    ID: record.id,
    Proprietario: record.proprietario,
    Tipo_Venda: record.tipoVenda,
    Bandeira: record.bandeira,
    Loja_Venda: record.lojaVenda,
    Marca_Veiculo: record.marcaVeiculo,
    Versao: record.versao,
    Classificacao: record.classificacao,
    Quantidade: String(record.quantidade),
    Data_solicitacao: formatDate(record.dataSolicitacao),
    Placa: record.placa,
    Regional: record.regional,
    Criado: formatDateTime(record.criado)
  };
}

async function fetchApi<T>(path: string, options?: RequestInit) {
  const response = await fetch(path, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export type SalesIntentionDateRange = {
  startDate?: string;
  endDate?: string;
  tipoVenda?: 'NOVOS' | 'SEMINOVOS';
};

export async function fetchSalesIntentions(
  dateRange?: SalesIntentionDateRange
): Promise<SalesIntentionReportRow[]> {
  const searchParams = new URLSearchParams();
  if (dateRange?.startDate) searchParams.set('startDate', dateRange.startDate);
  if (dateRange?.endDate) searchParams.set('endDate', dateRange.endDate);
  if (dateRange?.tipoVenda) searchParams.set('tipoVenda', dateRange.tipoVenda);
  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : '';
  const data = await fetchApi<SalesIntentionApiRecord[]>(`/api/sales-intentions${query}`);
  return data.map(transformApiRecord);
}

export async function fetchSalesIntentionCatalogs(): Promise<SalesIntentionCatalogRecord[]> {
  const catalog = await fetchApi<CompactSalesIntentionCatalog>('/api/sales-intention-catalogs');
  const [tipoVenda, bandeira, regional, lojaVenda, marcaVeiculo, versao, classificacao] =
    catalog.dictionaries;

  return catalog.combinations.map((combination) => ({
    Tipo_Venda: tipoVenda[combination[0]],
    Bandeira: bandeira[combination[1]],
    Regional: regional[combination[2]],
    Loja_Venda: lojaVenda[combination[3]],
    Marca_Veiculo: marcaVeiculo[combination[4]],
    Versao: versao[combination[5]],
    Classificacao: classificacao[combination[6]]
  }));
}

export async function createSalesIntention(payload: SalesIntentionPayload): Promise<SalesIntentionApiRecord> {
  return fetchApi<SalesIntentionApiRecord>('/api/sales-intentions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
