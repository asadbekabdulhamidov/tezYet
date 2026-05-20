import type { AxiosError } from "axios";
import type { Badge } from "../../../components/ui/Badge";
import type {
  AdminDriver,
  AdminOrder,
  AdminOrderStatus,
  AdminUser,
  ListResponse,
  PaginationResponse,
} from "./types";

type BadgeTone = Parameters<typeof Badge>[0]["tone"];

export function normalizeList<T>(data: ListResponse<T>): PaginationResponse<T> {
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  }
  return data;
}

export function getAdminErrorMessage(error: unknown): string {
  const err = error as AxiosError<{ detail?: unknown }>;
  const status = err.response?.status;
  const detail = err.response?.data?.detail;

  if (!err.response) return "Internet yo‘q";
  if (status === 403) return "Siz bu amalni bajara olmaysiz";
  if (status === 404) return "Topilmadi";
  if (status === 503) return "Xizmat vaqtincha mavjud emas";
  if (typeof detail === "string") return detail;
  return "Xatolik yuz berdi";
}

export function fullName(user: AdminUser | AdminDriver | null | undefined): string {
  if (!user) return "Noma’lum";
  const nested = "user" in user ? user.user : undefined;
  return user.full_name || user.name || nested?.full_name || nested?.name || "Noma’lum";
}

export function phoneOf(user: AdminUser | AdminDriver | null | undefined): string {
  if (!user) return "—";
  const nested = "user" in user ? user.user : undefined;
  return user.phone || nested?.phone || "—";
}

export function isActive(user: AdminUser): boolean {
  if (typeof user.is_active === "boolean") return user.is_active;
  if (typeof user.is_blocked === "boolean") return !user.is_blocked;
  return true;
}

export function statusTone(status: string | undefined): BadgeTone {
  if (status === "pending") return "pending";
  if (status === "accepted") return "accepted";
  if (status === "in_progress") return "in_progress";
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  return "default";
}

export function statusLabel(status: string | undefined): string {
  const labels: Record<AdminOrderStatus, string> = {
    pending: "Kutilmoqda",
    accepted: "Qabul qilingan",
    in_progress: "Yo‘lda",
    completed: "Yakunlangan",
    cancelled: "Bekor qilingan",
  };
  return status && status in labels ? labels[status as AdminOrderStatus] : status || "—";
}

export function formatMoney(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${new Intl.NumberFormat("uz-UZ").format(value)} so‘m`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

export function orderClient(order: AdminOrder): string {
  return order.client_name || fullName(order.client as AdminUser | undefined);
}

export function orderClientPhone(order: AdminOrder): string {
  return order.client_phone || phoneOf(order.client as AdminUser | undefined);
}

export function orderDriver(order: AdminOrder): string {
  return order.driver_name || fullName(order.driver as AdminDriver | AdminUser | undefined);
}
