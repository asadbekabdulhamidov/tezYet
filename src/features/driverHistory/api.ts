import { api } from "../../services/api";
import type { OrderHistoryItem, Pagination } from "./types";

const LIST_PATH = "/orders/driver/my/";
const PAGE_SIZE = 20;

type HistoryResponse = Pagination<OrderHistoryItem> | OrderHistoryItem[];

function normalizeHistory(
  data: HistoryResponse,
  pageOrUrl?: number | string | null,
): Pagination<OrderHistoryItem> {
  if (!Array.isArray(data)) return data;
  const page =
    typeof pageOrUrl === "number" && Number.isFinite(pageOrUrl) && pageOrUrl > 0
      ? pageOrUrl
      : 1;
  return {
    count: data.length,
    next: null,
    previous: page > 1 ? String(page - 1) : null,
    results: data,
  };
}

export async function getDriverHistoryPage(
  pageOrUrl?: number | string | null,
): Promise<Pagination<OrderHistoryItem>> {
  if (typeof pageOrUrl === "string" && pageOrUrl.length > 0) {
    const { data } = await api.get<HistoryResponse>(pageOrUrl);
    return normalizeHistory(data, pageOrUrl);
  }
  const page =
    typeof pageOrUrl === "number" && Number.isFinite(pageOrUrl) && pageOrUrl > 0
      ? pageOrUrl
      : 1;
  const { data } = await api.get<HistoryResponse>(LIST_PATH, {
    params: { page, page_size: PAGE_SIZE },
  });
  return normalizeHistory(data, page);
}
