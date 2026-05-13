import { useNavigate } from "react-router-dom";
import type { DriverAvailableOrder } from "../../../types/order";
import { formatSum } from "../../../shared/formatSum";

function googleMapsHref(o: DriverAvailableOrder): string {
  if (o.from_lat && o.from_lon && o.to_lat && o.to_lon) {
    return `https://www.google.com/maps/dir/${o.from_lat},${o.from_lon}/${o.to_lat},${o.to_lon}`;
  }
  const q = encodeURIComponent(`${o.from_address} → ${o.to_address}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

type Props = {
  order: DriverAvailableOrder;
  onAccept: (id: number) => void;
  accepting: boolean;
};

export function DriverOrderCard({ order, onAccept, accepting }: Props) {
  const nav = useNavigate();
  const distance =
    order.distance_km != null && order.distance_km !== ""
      ? `${Number(order.distance_km).toLocaleString("uz-UZ", { maximumFractionDigits: 1 })} km`
      : null;

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-lg">
            🚕
          </span>
          <div>
            <div className="text-base font-bold text-[#0F3460]">
              {formatSum(order.estimated_price)}
            </div>
            <div className="text-xs text-slate-500">
              {distance ? `${distance} • ` : ""}Naqd pul
            </div>
          </div>
        </div>
        <span className="rounded-full bg-[#FD7E14]/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-[#FD7E14]">
          Yangi
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex gap-2">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#28A745]" aria-hidden />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Olib ketish manzili
            </div>
            <div className="text-slate-800">{order.from_address}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#DC3545]" aria-hidden />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Borish manzili
            </div>
            <div className="text-slate-800">{order.to_address}</div>
          </div>
        </div>
      </div>

      {order.comment ? (
        <div className="mt-3 flex gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <span aria-hidden>💬</span>
          <span>{order.comment}</span>
        </div>
      ) : null}

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => nav(`/driver/order/${order.id}`)}
          className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700"
        >
          Batafsil
        </button>
        <button
          type="button"
          disabled={accepting}
          onClick={() => onAccept(order.id)}
          className="flex-1 rounded-xl bg-[#0F3460] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {accepting ? "…" : "Qabul qilish"}
        </button>
      </div>

      <a
        href={googleMapsHref(order)}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex h-24 items-center justify-center rounded-xl bg-slate-900/90 text-sm font-semibold text-white"
      >
        Xaritada ko&apos;rish
      </a>
    </article>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="h-9 w-9 rounded-xl bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-3 w-32 rounded bg-slate-100" />
        </div>
      </div>
      <div className="h-3 w-full rounded bg-slate-100" />
      <div className="h-3 max-w-[90%] rounded bg-slate-100" />
    </div>
  );
}

export function DriverOrdersSkeleton() {
  return (
    <div className="space-y-3">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
