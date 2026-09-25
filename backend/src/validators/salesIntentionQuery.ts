import type { Request } from 'express';
import { badRequest } from '../errors/AppError';
import type { SalesIntentionSearchFilters } from '../repositories/SalesIntentionRepository';

type RequestQuery = Request['query'];

const advancedSearchFields = [
  'proprietario', 'bandeira', 'lojaVenda', 'marcaVeiculo', 'versao', 'classificacao',
  'quantidade', 'ano_fabricacao', 'ano_modelo', 'placa', 'regional'
] as const;

export function parseSalesIntentionId(value: string): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function readQueryText(value: unknown): string | undefined {
  const candidate = Array.isArray(value)
    ? value.find((item): item is string => typeof item === 'string')
    : value;

  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : undefined;
}

function readQueryTexts(value: unknown): string | string[] | undefined {
  const values = (Array.isArray(value) ? value : [value])
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);

  return values.length === 0 ? undefined : values.length === 1 ? values[0] : [...new Set(values)];
}

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function parseDate(value: unknown, fieldName: string, required = false): Date | undefined {
  const text = readQueryText(value);
  if (!text && !required) return undefined;

  const date = text ? parseIsoDate(text) : null;
  if (!date) throw badRequest(`Informe ${fieldName} válido no formato YYYY-MM-DD.`);
  return date;
}

function parsePositiveInteger(value: unknown, fieldName: string): number | undefined {
  const text = readQueryText(value);
  if (!text) return undefined;

  const parsed = Number(text);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw badRequest(`Informe ${fieldName} como um inteiro positivo.`);
  }

  return parsed;
}

function parseTipoVenda(value: unknown): string | string[] | undefined {
  const texts = readQueryTexts(value);
  if (!texts) return undefined;

  const values = (Array.isArray(texts) ? texts : [texts]).map((text) => text.toUpperCase());
  if (values.some((item) => item !== 'NOVOS' && item !== 'SEMINOVOS')) {
    throw badRequest('tipoVenda deve ser NOVOS ou SEMINOVOS.');
  }

  return values.length === 1 ? values[0] : values;
}

function nextDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function assertValidRange(startDate?: Date, endDate?: Date): void {
  if (startDate && endDate && startDate >= endDate) {
    throw badRequest('startDate não pode ser posterior a endDate.');
  }
}

export function hasAdvancedSalesIntentionSearchFilters(query: RequestQuery): boolean {
  return advancedSearchFields.some((field) => readQueryText(query[field]) !== undefined);
}

export function parseSalesIntentionListQuery(query: RequestQuery) {
  const hasStartDate = query.startDate !== undefined;
  const hasEndDate = query.endDate !== undefined;
  let dateRange: { gte: Date; lt: Date } | undefined;

  if (hasStartDate || hasEndDate) {
    if (!hasStartDate || !hasEndDate) {
      throw badRequest('Informe startDate e endDate válidos no formato YYYY-MM-DD.');
    }

    const startDate = parseDate(query.startDate, 'startDate', true)!;
    const exclusiveEndDate = nextDay(parseDate(query.endDate, 'endDate', true)!);
    assertValidRange(startDate, exclusiveEndDate);
    dateRange = { gte: startDate, lt: exclusiveEndDate };
  }

  return { dateRange, tipoVenda: parseTipoVenda(query.tipoVenda) };
}

export function parseSalesIntentionSearchQuery(query: RequestQuery): SalesIntentionSearchFilters {
  const startDate = parseDate(query.startDate, 'startDate');
  const endDate = parseDate(query.endDate, 'endDate');
  const exclusiveEndDate = endDate ? nextDay(endDate) : undefined;
  assertValidRange(startDate, exclusiveEndDate);

  const tipoVenda = parseTipoVenda(query.tipoVenda);
  const proprietario = readQueryTexts(query.proprietario);
  const bandeira = readQueryTexts(query.bandeira);
  const lojaVenda = readQueryTexts(query.lojaVenda);
  const marcaVeiculo = readQueryTexts(query.marcaVeiculo);
  const versao = readQueryTexts(query.versao);
  const classificacao = readQueryTexts(query.classificacao);
  const quantidade = parsePositiveInteger(query.quantidade, 'quantidade');
  const anoFabricacao = parsePositiveInteger(query.ano_fabricacao, 'ano_fabricacao');
  const anoModelo = parsePositiveInteger(query.ano_modelo, 'ano_modelo');
  const placa = readQueryTexts(query.placa);
  const regional = readQueryTexts(query.regional);

  return {
    ...(startDate ? { startDate } : {}),
    ...(exclusiveEndDate ? { endDate: exclusiveEndDate } : {}),
    ...(tipoVenda ? { tipoVenda } : {}),
    ...(proprietario ? { proprietario } : {}),
    ...(bandeira ? { bandeira } : {}),
    ...(lojaVenda ? { lojaVenda } : {}),
    ...(marcaVeiculo ? { marcaVeiculo } : {}),
    ...(versao ? { versao } : {}),
    ...(classificacao ? { classificacao } : {}),
    ...(quantidade !== undefined ? { quantidade } : {}),
    ...(anoFabricacao !== undefined ? { ano_fabricacao: anoFabricacao } : {}),
    ...(anoModelo !== undefined ? { ano_modelo: anoModelo } : {}),
    ...(placa ? { placa } : {}),
    ...(regional ? { regional } : {})
  };
}
