import { api } from "../../services/api";
import type { OrderHistoryItem, Pagination } from "./types";

const LIST_PATH = "/orders/driver/my/";

export async function getDriverHistoryPage(
  pageOrUrl?: number | string | null,
): Promise<Pagination<OrderHistoryItem>> {
  if (typeof pageOrUrl === "string" && pageOrUrl.length > 0) {
    const { data } = await api.get<Pagination<OrderHistoryItem>>(pageOrUrl);
    return data;
  }
  const page =
    typeof pageOrUrl === "number" && Number.isFinite(pageOrUrl) && pageOrUrl > 0
      ? pageOrUrl
      : 1;
  const { data } = await api.get<Pagination<OrderHistoryItem>>(LIST_PATH, {
    params: { page, page_size: 20 },
  });
  return data;
}
