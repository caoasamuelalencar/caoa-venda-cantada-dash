"use client";

import { useEffect, useState } from "react";
import { fetchSalesIntentions, type SalesIntentionReportRow } from "@/lib/salesIntentionApi";

export function useSalesIntentions() {
  const [items, setItems] = useState<SalesIntentionReportRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchSalesIntentions();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, []);

  return {
    items,
    isLoading,
    error,
    refresh: loadItems,
  };
}
