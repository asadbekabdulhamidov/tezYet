import type { OrderDetail } from "../types/orderDetail";

export function normalizeWsOrderPatch(raw: unknown): Partial<OrderDetail> | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id === "number" && "status" in o) {
    return o as Partial<OrderDetail>;
  }
  for (const key of ["order", "data", "payload"]) {
    const inner = o[key];
    if (inner && typeof inner === "object") {
      const p = normalizeWsOrderPatch(inner);
      if (p) return p;
    }
  }
  return null;
}
