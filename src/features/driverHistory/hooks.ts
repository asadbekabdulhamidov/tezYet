import { useCallback, useEffect, useMemo, useState } from "react";
import { getDriverHistoryPage } from "./api";
import type {
  HistoryStatusFilter,
  HistoryTimeFilter,
  OrderHistoryItem,
} from "./types";
import {
  applyHistoryFilters,
  computeHasDates,
} from "./utils";

export function useDriverHistory() {
  const [items, setItems] = useState<OrderHistoryItem[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [page, setPageState] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<HistoryStatusFilter>("all");
  const [timeFilter, setTimeFilter] = useState<HistoryTimeFilter>("all");

  const hasDates = useMemo(() => computeHasDates(items), [items]);

  const filteredItems = useMemo(
    () => applyHistoryFilters(items, statusFilter, timeFilter, hasDates),
    [items, statusFilter, timeFilter, hasDates],
  );

  const fetchInternal = useCallback(async (pageOrUrl: number | string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDriverHistoryPage(pageOrUrl);
      setItems(data.results);
      setCount(data.count);
      setNext(data.next);
      setPrevious(data.previous);
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      setError(String(d || "Ma’lumotlarni yuklashda xato yuz berdi."));
      setItems([]);
      setCount(0);
      setNext(null);
      setPrevious(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchInternal(1);
  }, [fetchInternal]);

  const refetch = useCallback(async () => {
    await fetchInternal(page);
  }, [fetchInternal, page]);

  const setPage = useCallback(
    async (n: number) => {
      setPageState(n);
      await fetchInternal(n);
    },
    [fetchInternal],
  );

  const loadNext = useCallback(async () => {
    if (!next) return;
    await fetchInternal(next);
    setPageState((p) => p + 1);
  }, [fetchInternal, next]);

  const loadPrev = useCallback(async () => {
    if (!previous) return;
    await fetchInternal(previous);
    setPageState((p) => Math.max(1, p - 1));
  }, [fetchInternal, previous]);

  return {
    items: filteredItems,
    rawItems: items,
    isLoading,
    error,
    page,
    count,
    next,
    previous,
    setPage,
    loadNext,
    loadPrev,
    refetch,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    hasDates,
  };
}
