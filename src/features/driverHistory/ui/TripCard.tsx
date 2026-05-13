import type { OrderHistoryItem } from "../types";
import { Badge } from "../../../shared/ui/Badge";
import { formatSum } from "../../../shared/formatSum";

function displayPrice(item: OrderHistoryItem): string {
  if (item.final_price != null && item.final_price !== undefined) {
    return formatSum(item.final_price);
  }
  if (item.estimated_price != null && item.estimated_price !== undefined) {
    return formatSum(item.estimated_price);
  }
  return "—";
}

function formatWhen(item: OrderHistoryItem): string {
  const raw = item.completed_at ?? item.accepted_at ?? item.created_at;
  if (!raw) return "Sana noma’lum";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return "Sana noma’lum";
  return d.toLocaleString("uz-UZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(item: OrderHistoryItem) {
  const s = item.status;
  if (s === "completed") {
    return <Badge variant="success">Yakunlandi</Badge>;
  }
  if (s === "cancelled") {
    return <Badge variant="danger">Bekor qilindi</Badge>;
  }
  if (s === "pending") {
    return <Badge variant="warning">Kutilmoqda</Badge>;
  }
  if (s === "accepted") {
    return <Badge variant="secondary">Qabul qilindi</Badge>;
  }
  if (s === "in_progress") {
    return <Badge variant="secondary">Yo’lda</Badge>;
  }
  return (
    <Badge variant="secondary">{item.status_display || s}</Badge>
  );
}

export function TripCard({ item }: { item: OrderHistoryItem }) {
  const km = item.distance_km;
  const showKm =
    km != null && km !== "" && !Number.isNaN(parseFloat(String(km)));

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100/90 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-2 border-b border-slate-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🚕
          </span>
          <span className="text-lg font-extrabold text-[#0F3460]">
            {displayPrice(item)}
          </span>
        </div>
        {statusBadge(item)}
      </div>
      <div className="px-4 py-3">
        <div className="text-xs text-slate-500">{formatWhen(item)}</div>
        <div className="mt-3 flex gap-2">
          <div className="flex w-5 flex-col items-center pt-0.5">
            <span className="h-2 w-2 rounded-full bg-[#1A6BAC]" />
            <div className="my-0.5 min-h-[20px] w-px flex-1 bg-slate-200" />
            <span className="h-2 w-2 rounded-full bg-[#DC3545]" />
          </div>
          <div className="min-w-0 flex-1 space-y-3 text-sm">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Jo&apos;natish joyi
              </div>
              <div className="font-medium text-slate-900">{item.from_address}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">
                Manzil
              </div>
              <div className="font-medium text-slate-900">{item.to_address}</div>
            </div>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-50 pt-3 text-xs text-slate-600">
          <div className="flex flex-wrap gap-3">
            {showKm ? (
              <span>
                <span className="font-semibold text-slate-800">
                  {parseFloat(String(km)).toFixed(1)} km
                </span>
              </span>
            ) : null}
            <span className="font-semibold text-slate-800">{formatWhen(item)}</span>
          </div>
          <button
            type="button"
            className="text-xs font-bold text-[#1A6BAC]"
            disabled
          >
            Tafsilotlar ›
          </button>
        </div>
      </div>
    </article>
  );
}
