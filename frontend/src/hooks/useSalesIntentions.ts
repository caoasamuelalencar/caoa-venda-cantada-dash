"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAllSalesIntentions,
  fetchSalesIntentions,
  formatSalesIntentionApiError,
  type SalesIntentionDateRange,
  type SalesIntentionReportRow,
} from "@/lib/salesIntentionApi";

type UseSalesIntentionsOptions = {
  searchAll?: boolean;
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

  const loadItems = useCallback(async (requestOptions?: { silent?: boolean }) => {
    const silent = requestOptions?.silent ?? false;
    const timeoutMs = options?.timeoutMs;
    const controller = timeoutMs ? new AbortController() : null;
    const timeoutId = timeoutMs
      ? window.setTimeout(() => controller?.abort(), timeoutMs)
      : null;

    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = options?.searchAll
        ? await fetchAllSalesIntentions({ signal: controller?.signal })
        : await fetchSalesIntentions(
            { startDate, endDate, tipoVenda, bandeira },
            { signal: controller?.signal },
          );
      setItems(data);
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(
        controller?.signal.aborted
          ? "A busca demorou mais que o esperado. Tente atualizar novamente."
          : formatSalesIntentionApiError(err),
      );
    } finally {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      if (silent) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, [
    endDate,
    bandeira,
    options?.searchAll,
    options?.timeoutMs,
    startDate,
    tipoVenda,
  ]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  return {
    items,
    isLoading,
    isRefreshing,
    error,
    lastUpdatedAt,
    refresh: loadItems,
  };
}
