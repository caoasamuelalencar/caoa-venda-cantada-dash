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

export type SalesIntentionCatalogHierarchyRecord = {
  bandeira: string;
  regional: string;
  lojaVenda: string;
};

export type SalesIntentionCatalogSources = {
  tipoVenda: string[];
  bandeira: string[];
  regional: string[];
  lojaVenda: string[];
};

export type SalesIntentionCatalogResponse = {
  version: 3;
  sources: SalesIntentionCatalogSources;
  hierarchy: SalesIntentionCatalogHierarchyRecord[];
  combinations: SalesIntentionCatalogRecord[];
};

export type SalesIntentionModelosDealerRecord = {
  tipoVenda: string;
  marca: string;
  modelo: string;
  versaoModelo: string;
};

export type SalesIntentionModelosDealerSources = {
  tipoVenda: string[];
  marca: string[];
  modelo: string[];
  versaoModelo: string[];
};

export type SalesIntentionModelosDealerResponse = {
  version: 1;
  sources: SalesIntentionModelosDealerSources;
  combinations: SalesIntentionModelosDealerRecord[];
};

export type SalesIntentionClassificacaoVendaResponse = string[];

export type SalesIntentionModelosDealerLookupRecord = {
  marcaVeiculo: string | null;
  modelo: string | null;
  versao: string | null;
  ano: string | number | null;
};

export type SalesIntentionModelosDealerLookupResponse = {
  found: boolean;
  record: SalesIntentionModelosDealerLookupRecord | null;
};

function buildSalesIntentionApiErrorMessage(status: number | null) {
  if (status === 401 || status === 403) {
    return "Você não tem permissão para acessar estes dados.";
  }

  if (status === 400 || status === 422) {
    return "Não conseguimos aplicar os filtros informados. Revise o período e tente novamente.";
  }

  if (status === 404) {
    return "Não encontramos dados para o período selecionado.";
  }

  if (status !== null && status >= 500) {
    return "Estamos com instabilidade para carregar os dados agora. Tente novamente em alguns instantes.";
  }

  if (status === null) {
    return "Não conseguimos acessar os dados agora. Verifique sua conexão e tente novamente.";
  }

  return "Não conseguimos carregar os dados agora. Tente novamente em alguns instantes.";
}

export class SalesIntentionApiError extends Error {
  status: number | null;
  details?: string;

  constructor(status: number | null, details?: string) {
    super(buildSalesIntentionApiErrorMessage(status));
    this.name = 'SalesIntentionApiError';
    this.status = status;
    this.details = details?.trim() || undefined;
  }
}

export function formatSalesIntentionApiError(error: unknown) {
  if (error instanceof SalesIntentionApiError) {
    return error.message;
  }

  const status =
    error && typeof error === 'object' && 'status' in error && typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : null;

  return buildSalesIntentionApiErrorMessage(status);
}

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
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
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
    Data_solicitacao: formatDateTime(record.dataSolicitacao),
    Placa: record.placa,
    Regional: record.regional,
    Criado: formatDateTime(record.criado)
  };
}

async function fetchApi<T>(path: string, options?: RequestInit) {
  const response = await fetch(path, options);
  if (!response.ok) {
    const body = await response.text();
    throw new SalesIntentionApiError(response.status, body);
  }
  return response.json() as Promise<T>;
}

type ReadRequestOptions = Pick<RequestInit, 'signal'> & {
  /** Bypasses the short-lived in-memory cache, used by an explicit refresh. */
  force?: boolean;
};

type CachedRead = {
  expiresAt: number;
  promise: Promise<unknown>;
  pending: boolean;
};

// This cache is intentionally kept only in the current browser tab. Besides
// avoiding stale persisted data, it coalesces React development-mode effects
// and quick route changes into one HTTP request.
const readRequests = new Map<string, CachedRead>();
const SALES_INTENTIONS_READ_CACHE_TTL_MS = 15_000;
const SALES_INTENTION_CATALOG_READ_CACHE_TTL_MS = 5 * 60 * 1_000;
const LATEST_REQUEST_DATE_CACHE_TTL_MS = 60_000;

function abortError() {
  return new DOMException('The operation was aborted.', 'AbortError');
}

function withAbortSignal<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());

  return new Promise<T>((resolve, reject) => {
    const onAbort = () => reject(abortError());
    signal.addEventListener('abort', onAbort, { once: true });

    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

function fetchCachedApi<T>(
  path: string,
  ttlMs: number,
  options?: ReadRequestOptions,
): Promise<T> {
  if (options?.force) {
    readRequests.delete(path);
  }

  const cached = readRequests.get(path);
  // An expensive request can outlive its cache TTL. It must still be shared
  // until it settles, otherwise a slow endpoint starts another identical query.
  if (cached && (cached.pending || cached.expiresAt > Date.now())) {
    return withAbortSignal(cached.promise as Promise<T>, options?.signal ?? undefined);
  }

  const promise = fetchApi<T>(path);
  const entry: CachedRead = {
    expiresAt: Date.now() + ttlMs,
    promise,
    pending: true,
  };

  readRequests.set(path, entry);
  void promise.then(
    () => {
      if (readRequests.get(path) === entry) {
        entry.pending = false;
        entry.expiresAt = Date.now() + ttlMs;
      }
    },
    () => {
      if (readRequests.get(path) === entry) {
        readRequests.delete(path);
      }
    },
  );

  return withAbortSignal(promise, options?.signal ?? undefined);
}

export function invalidateSalesIntentionReadCache() {
  readRequests.clear();
}

export type SalesIntentionDateRange = {
  startDate?: string;
  endDate?: string;
  proprietario?: string | string[];
  tipoVenda?: 'NOVOS' | 'SEMINOVOS';
  bandeira?: string;
};

export type SalesIntentionDrillDownFilters = {
  startDate?: string;
  endDate?: string;
  proprietario?: string | string[];
  tipoVenda?: string | string[];
  bandeira?: string | string[];
  lojaVenda?: string | string[];
  marcaVeiculo?: string | string[];
  versao?: string | string[];
  classificacao?: string | string[];
  regional?: string | string[];
};

export async function fetchLatestSalesIntentionRequestDate(): Promise<string | null> {
  const response = await fetchCachedApi<{ date?: string | null }>(
    '/api/sales-intentions/latest-request-date',
    LATEST_REQUEST_DATE_CACHE_TTL_MS,
  );

  return typeof response.date === 'string' && response.date ? response.date : null;
}

export async function fetchSalesIntentions(
  dateRange?: SalesIntentionDateRange,
  requestOptions?: ReadRequestOptions,
): Promise<SalesIntentionReportRow[]> {
  const searchParams = new URLSearchParams();
  if (dateRange?.startDate) searchParams.set('startDate', dateRange.startDate);
  if (dateRange?.endDate) searchParams.set('endDate', dateRange.endDate);
  if (dateRange?.tipoVenda) searchParams.set('tipoVenda', dateRange.tipoVenda);
  if (dateRange?.bandeira) searchParams.set('bandeira', dateRange.bandeira);

  const hasPartialDateRange = Boolean(dateRange?.startDate) !== Boolean(dateRange?.endDate);
  const hasAdvancedSearchFilters = Boolean(dateRange?.bandeira);
  const endpoint =
    hasPartialDateRange || hasAdvancedSearchFilters
      ? '/api/sales-intentions/search'
      : '/api/sales-intentions';
  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : '';
  const data = await fetchCachedApi<SalesIntentionApiRecord[]>(
    `${endpoint}${query}`,
    SALES_INTENTIONS_READ_CACHE_TTL_MS,
    requestOptions,
  );
  return data.map(transformApiRecord);
}

export async function fetchAllSalesIntentions(
  requestOptions?: ReadRequestOptions,
): Promise<SalesIntentionReportRow[]> {
  const data = await fetchCachedApi<SalesIntentionApiRecord[]>(
    '/api/sales-intentions/search',
    SALES_INTENTIONS_READ_CACHE_TTL_MS,
    requestOptions,
  );
  return data.map(transformApiRecord);
}

/** Fetches the source records for a chart segment using the same server filters. */
export async function fetchSalesIntentionDrillDown(
  filters: SalesIntentionDrillDownFilters,
  requestOptions?: ReadRequestOptions,
): Promise<SalesIntentionReportRow[]> {
  const searchParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    const values = Array.isArray(value) ? value : [value];
    values.forEach((item) => {
      if (item?.trim()) searchParams.append(key, item);
    });
  });

  const query = searchParams.size ? `?${searchParams.toString()}` : "";
  const data = await fetchCachedApi<SalesIntentionApiRecord[]>(
    `/api/sales-intentions/search${query}`,
    SALES_INTENTIONS_READ_CACHE_TTL_MS,
    requestOptions,
  );
  return data.map(transformApiRecord);
}

export async function fetchSalesIntentionCatalogs(): Promise<SalesIntentionCatalogResponse> {
  return fetchCachedApi<SalesIntentionCatalogResponse>(
    '/api/sales-intention-catalogs',
    SALES_INTENTION_CATALOG_READ_CACHE_TTL_MS,
  );
}

export async function fetchSalesIntentionModelosDealer(): Promise<SalesIntentionModelosDealerResponse> {
  return fetchCachedApi<SalesIntentionModelosDealerResponse>(
    '/api/sales-intention-modelos-dealer',
    SALES_INTENTION_CATALOG_READ_CACHE_TTL_MS,
  );
}

export async function fetchSalesIntentionClassificacoes(): Promise<SalesIntentionClassificacaoVendaResponse> {
  return fetchCachedApi<SalesIntentionClassificacaoVendaResponse>(
    '/api/sales-intention-classificacoes',
    SALES_INTENTION_CATALOG_READ_CACHE_TTL_MS,
  );
}

export async function lookupSalesIntentionModelosDealerByPlate(
  placa: string
): Promise<SalesIntentionModelosDealerLookupRecord | null> {
  const searchParams = new URLSearchParams();
  searchParams.set('placa', placa.trim());

  const response = await fetchApi<SalesIntentionModelosDealerLookupResponse>(
    `/api/sales-intention-modelos-dealer?${searchParams.toString()}`,
    {
      cache: 'no-store'
    }
  );

  return response.found && response.record ? response.record : null;
}

export async function updateSalesIntention(
  id: number,
  payload: Partial<Pick<SalesIntentionPayload, 'quantidade' | 'dataSolicitacao'>>,
): Promise<SalesIntentionReportRow> {
  const data = await fetchApi<SalesIntentionApiRecord>(`/api/sales-intentions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  invalidateSalesIntentionReadCache();

  return transformApiRecord(data);
}

export async function createSalesIntention(payload: SalesIntentionPayload): Promise<SalesIntentionApiRecord> {
  const data = await fetchApi<SalesIntentionApiRecord>('/api/sales-intentions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  invalidateSalesIntentionReadCache();
  return data;
}
