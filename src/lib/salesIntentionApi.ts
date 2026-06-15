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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

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
  const response = await fetch(`${API_BASE_URL}${path}`, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchSalesIntentions(): Promise<SalesIntentionReportRow[]> {
  const data = await fetchApi<SalesIntentionApiRecord[]>('/sales-intentions');
  return data.map(transformApiRecord);
}

export async function createSalesIntention(payload: SalesIntentionPayload): Promise<SalesIntentionApiRecord> {
  return fetchApi<SalesIntentionApiRecord>('/sales-intentions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}
