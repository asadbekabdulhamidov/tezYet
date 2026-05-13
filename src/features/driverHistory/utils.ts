import type {
  HistoryStatusFilter,
  HistoryTimeFilter,
  OrderHistoryItem,
} from "./types";

export function historyItemDate(item: OrderHistoryItem): Date | null {
  const raw = item.completed_at ?? item.accepted_at ?? item.created_at;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function computeHasDates(items: OrderHistoryItem[]): boolean {
  return items.some((i) => historyItemDate(i) !== null);
}

function startOfToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

function startOfWeek(): Date {
  const t = startOfToday();
  const dow = t.getDay();
  const diff = (dow + 6) % 7;
  t.setDate(t.getDate() - diff);
  return t;
}

function startOfMonth(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), 1);
}

export function applyHistoryFilters(
  items: OrderHistoryItem[],
  status: HistoryStatusFilter,
  time: HistoryTimeFilter,
  hasDates: boolean,
): OrderHistoryItem[] {
  let r = items;
  if (status === "completed") {
    r = r.filter((i) => i.status === "completed");
  } else if (status === "cancelled") {
    r = r.filter((i) => i.status === "cancelled");
  }
  if (!hasDates || time === "all") return r;
  const bounds =
    time === "today"
      ? startOfToday()
      : time === "week"
        ? startOfWeek()
        : startOfMonth();
  return r.filter((i) => {
    const d = historyItemDate(i);
    if (!d) return false;
    return d >= bounds;
  });
}

export function pageIncomeSum(items: OrderHistoryItem[]): number {
  return items.reduce((acc, i) => {
    if (i.status !== "completed") return acc;
    const p = i.final_price ?? i.estimated_price;
    return acc + (typeof p === "number" ? p : 0);
  }, 0);
}

export function countTripsSince(
  items: OrderHistoryItem[],
  since: Date,
): number {
  return items.filter((i) => {
    const d = historyItemDate(i);
    return d && d >= since;
  }).length;
}

export function historyStartOfToday(): Date {
  return startOfToday();
}

export function historyStartOfWeek(): Date {
  return startOfWeek();
}
