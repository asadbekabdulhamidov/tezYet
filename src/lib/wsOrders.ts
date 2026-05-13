import type { DriverAvailableOrder } from "../types/order";

/** Backend WS xabari turli formatda bo‘lishi mumkin — mavjudlarni birlashtiramiz */
export function normalizeWsOrdersPayload(raw: unknown): DriverAvailableOrder[] | null {
  if (Array.isArray(raw)) {
    return raw.filter(isOrderLike);
  }
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    for (const key of ["orders", "results", "available", "payload"]) {
      const v = o[key];
      if (Array.isArray(v) && v.every(isOrderLike)) {
        return v as DriverAvailableOrder[];
      }
    }
    if (isOrderLike(o)) {
      return [o as DriverAvailableOrder];
    }
    const inner = o.data ?? o.order;
    if (inner && typeof inner === "object" && isOrderLike(inner)) {
      return [inner as DriverAvailableOrder];
    }
  }
  return null;
}

function isOrderLike(x: unknown): x is DriverAvailableOrder {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === "number" && typeof o.from_address === "string";
}
