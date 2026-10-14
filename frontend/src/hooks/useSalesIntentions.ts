"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAllSalesIntentions,
  fetchSalesIntentionDrillDown,
  fetchSalesIntentions,
  formatSalesIntentionApiError,
  type SalesIntentionDateRange,
  type SalesIntentionDrillDownFilters,
  type SalesIntentionReportRow,
} from "@/lib/salesIntentionApi";

type UseSalesIntentionsOptions = {
  searchAll?: boolean;
  searchFilters?: SalesIntentionDrillDownFilters;
  timeoutMs?: number;
};

export function useSalesIntentions(
  dateRange?: SalesIntentionDateRange,
  options?: UseSalesIntentionsOptions,
) {
  const [items, setItems] = useState<SalesIntentionReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const startDate = dateRange?.startDate;
  const endDate = dateRange?.endDate;
  const tipoVenda = dateRange?.tipoVenda;
  const bandeira = dateRange?.bandeira;
  const searchFilters = options?.searchFilters;

  const loadItems = useCallback(async (requestOptions?: {
    silent?: boolean;
    force?: boolean;
    signal?: AbortSignal;
  }) => {
    const silent = requestOptions?.silent ?? false;
    const timeoutMs = options?.timeoutMs;
    const controller = new AbortController();
    const abort = () => controller.abort();
    requestOptions?.signal?.addEventListener('abort', abort, { once: true });
    let timedOut = false;
    const timeoutId = timeoutMs
      ? window.setTimeout(() => {
          timedOut = true;
          abort();
        }, timeoutMs)
      : null;

    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = searchFilters
        ? await fetchSalesIntentionDrillDown(searchFilters, {
            signal: controller.signal,
            force: requestOptions?.force,
          })
        : options?.searchAll
        ? await fetchAllSalesIntentions({ signal: controller.signal, force: requestOptions?.force })
        : await fetchSalesIntentions(
            { startDate, endDate, tipoVenda, bandeira },
            { signal: controller.signal, force: requestOptions?.force },
          );
      setItems(data);
      setLastUpdatedAt(new Date());
    } catch (err) {
      if (timedOut) {
        setError("A busca demorou mais que o esperado. Tente atualizar novamente.");
      } else if (!controller.signal.aborted) {
        setError(formatSalesIntentionApiError(err));
      }
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      // A superseded navigation must not clear the loading state of the new
      // request started immediately after it (React Strict Mode does this too).
      if (!requestOptions?.signal?.aborted) {
        if (silent) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
      requestOptions?.signal?.removeEventListener('abort', abort);
    }
  }, [
    endDate,
    bandeira,
    searchFilters,
    options?.searchAll,
    options?.timeoutMs,
    startDate,
    tipoVenda,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    void loadItems({ signal: controller.signal });
    return () => controller.abort();
  }, [loadItems]);

  return {
    items,
    isLoading,
    isRefreshing,
    error,
    lastUpdatedAt,
    refresh: (requestOptions?: { silent?: boolean }) =>
      loadItems({ ...requestOptions, force: true }),
  };
}
