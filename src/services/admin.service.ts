import { api } from "./api";
import type {
  AdminDriver,
  AdminOrder,
  AdminOrderStatus,
  AdminUser,
  CreateDriverPayload,
  DriverReview,
  ListResponse,
  PaginationResponse,
} from "../features/admin/lib/types";
import { normalizeList } from "../features/admin/lib/utils";
import type {
  CreateOrderPayload,
  EstimatePayload,
  EstimateResult,
} from "./client-orders.service";

const PAGE_SIZE = 20;

export async function fetchAdminUsers(page = 1): Promise<PaginationResponse<AdminUser>> {
  const { data } = await api.get<ListResponse<AdminUser>>("/users/admin/users/", {
    params: { page, page_size: PAGE_SIZE },
  });
  return normalizeList(data);
}

export async function toggleAdminUserActive(id: number): Promise<AdminUser | null> {
  const { data } = await api.post<AdminUser | null>(
    `/users/admin/users/${id}/toggle-active/`,
  );
  return data ?? null;
}

export async function fetchAdminDrivers(page = 1): Promise<PaginationResponse<AdminDriver>> {
  const { data } = await api.get<ListResponse<AdminDriver>>(
    "/users/admin/drivers/",
    {
      params: { page, page_size: PAGE_SIZE },
    },
  );
  return normalizeList(data);
}

export async function createAdminDriver(
  payload: CreateDriverPayload,
): Promise<AdminDriver> {
  const { name, ...rest } = payload;
  const { data } = await api.post<AdminDriver>(
    "/users/admin/drivers/create/",
    { ...rest, full_name: name },
  );
  return data;
}

export async function fetchAdminOrders({
  page = 1,
  status,
}: {
  page?: number;
  status?: AdminOrderStatus | "all";
}): Promise<PaginationResponse<AdminOrder>> {
  const params: Record<string, string | number> = {
    page,
    page_size: PAGE_SIZE,
  };
  if (status && status !== "all") {
    params.status = status;
  }
  const { data } = await api.get<ListResponse<AdminOrder>>("/orders/admin/all/", {
    params,
  });
  return normalizeList(data);
}

export async function createAdminOrder(
  payload: CreateOrderPayload,
): Promise<AdminOrder> {
  const { data } = await api.post<AdminOrder>("/orders/", payload);
  return data;
}

export async function estimateAdminOrder(
  payload: EstimatePayload,
): Promise<EstimateResult> {
  const { data } = await api.post<EstimateResult>("/orders/estimate/", payload);
  return data;
}

export async function fetchDriverReviews(
  driverId: number,
): Promise<PaginationResponse<DriverReview>> {
  const { data } = await api.get<ListResponse<DriverReview>>(
    `/reviews/driver/${driverId}/`,
  );
  return normalizeList(data);
}
