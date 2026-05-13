import type { OrderDetail, OrderStatus } from "../../../types/orderDetail";
import { formatSum } from "../../../shared/formatSum";
import { Loader } from "../../../shared/ui/Loader";
import {
  etaMinutesLabel,
  parseKm,
  rideHeadline,
  ORDER_STEPS,
  stepModes,
} from "./orderScreenUtils";

export function RideStatusFloat({
  order,
  status,
}: {
  order: OrderDetail;
  status: OrderStatus;
}) {
  const km = parseKm(order.distance_km);
  const eta = etaMinutesLabel(km);
  const payHint = status === "in_progress" ? " (karta / naqd)" : "";

  return (
    <div className="relative z-10 -mt-14 px-4">
      <div className="rounded-2xl border border-white/70 bg-white/95 p-4 shadow-[0_8px_32px_rgba(15,52,96,0.12)] backdrop-blur-md">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold leading-tight text-[#1A6BAC]">
              {rideHeadline(status)}
            </h2>
            <div className="mt-1 text-2xl font-extrabold tracking-tight text-[#0F3460]">
              {formatSum(order.estimated_price)}
              <span className="text-base font-semibold text-slate-500">
                {payHint}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-4 border-t border-slate-100 pt-3 text-sm text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-base" aria-hidden>
              📍
            </span>
            <span className="font-semibold text-slate-800">
              {km > 0 ? `${km.toFixed(1)} km` : "—"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-base" aria-hidden>
              ⏱
            </span>
            <span className="font-semibold text-slate-800">
              {eta === "—" ? "—" : `~${eta} daqiqa`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomerCard({ order }: { order: OrderDetail }) {
  const tel = order.client_phone.replace(/\s/g, "");
  const wa = tel.replace(/\D/g, "");
  return (
    <section className="mx-4 mt-4 rounded-2xl border border-slate-100/90 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F3460] to-[#1A6BAC] text-xl font-bold text-white shadow-inner">
          {order.client_name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-slate-900">{order.client_name}</div>
          <a
            href={`tel:${tel}`}
            className="text-sm font-medium text-[#1A6BAC] underline-offset-2 hover:underline"
          >
            {order.client_phone}
          </a>
        </div>
      </div>
      {order.comment ? (
        <div className="mt-3 rounded-xl border border-[#1A6BAC]/25 bg-[#1A6BAC]/5 px-3 py-2 text-sm text-slate-800">
          <span className="font-semibold text-[#1A6BAC]">Izoh: </span>
          {order.comment}
        </div>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-[#0F3460] active:bg-slate-50"
        >
          💬 Chat
        </a>
        <a
          href={`tel:${tel}`}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#0F3460] py-2.5 text-sm font-semibold text-white shadow-md active:opacity-90"
        >
          📞 Qo‘ng‘iroq
        </a>
      </div>
    </section>
  );
}

export function RouteBlock({ order }: { order: OrderDetail }) {
  return (
    <section className="mx-4 mt-4 space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="flex w-6 flex-col items-center pt-1">
          <span className="h-3 w-3 rounded-full bg-[#28A745] ring-4 ring-[#28A745]/20" />
          <div className="my-1 min-h-[24px] w-0.5 flex-1 bg-gradient-to-b from-[#28A745]/40 to-[#DC3545]/40" />
          <span className="h-3 w-3 rounded-full bg-[#DC3545] ring-4 ring-[#DC3545]/20" />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Jo&apos;nash joyi
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {order.from_address}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Yakuniy manzil
            </div>
            <div className="text-sm font-semibold text-slate-900">
              {order.to_address}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TripTimeline({ status }: { status: OrderStatus }) {
  const modes = stepModes(status);
  return (
    <section className="mx-4 mt-5 pb-6">
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        Safar holati
      </h3>
      <div className="space-y-0">
        {ORDER_STEPS.map((label, i) => {
          const m = modes[i];
          return (
            <div key={label} className="flex gap-3 pb-4 last:pb-0">
              <div className="flex w-8 flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    m === "done"
                      ? "bg-[#1A6BAC] text-white shadow-md"
                      : m === "current"
                        ? "bg-[#6F42C1] text-white shadow-[0_0_0_4px_rgba(111,66,193,0.25)] animate-pulse"
                        : "border-2 border-slate-200 bg-white text-slate-300"
                  }`}
                >
                  {m === "done" ? "✓" : i + 1}
                </div>
                {i < ORDER_STEPS.length - 1 ? (
                  <div
                    className={`my-0.5 min-h-[12px] w-0.5 flex-1 ${
                      m === "done" ? "bg-[#1A6BAC]/35" : "bg-slate-200"
                    }`}
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1 pt-1">
                <div
                  className={`text-sm font-semibold ${
                    m === "current"
                      ? "text-[#6F42C1]"
                      : m === "done"
                        ? "text-slate-800"
                        : "text-slate-400"
                  }`}
                >
                  {label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function ActionBar({
  status,
  busy,
  onStart,
  onComplete,
  onCancel,
}: {
  status: OrderStatus;
  busy: boolean;
  onStart: () => void;
  onComplete: () => void;
  onCancel: () => void;
}) {
  if (status === "completed" || status === "cancelled") return null;
  return (
    <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 mx-4 mt-4 space-y-2 pb-2">
      {status === "accepted" ? (
        <button
          type="button"
          disabled={busy}
          onClick={onStart}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0F3460] py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(15,52,96,0.35)] active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader variant="button" tone="onDark" />
              Yuklanmoqda…
            </>
          ) : (
            "Safarni boshlash"
          )}
        </button>
      ) : null}
      {status === "in_progress" ? (
        <button
          type="button"
          disabled={busy}
          onClick={onComplete}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#28A745] py-4 text-base font-bold text-white shadow-[0_8px_24px_rgba(40,167,69,0.35)] active:scale-[0.99] disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader variant="button" tone="onDark" />
              Yuklanmoqda…
            </>
          ) : (
            "Safarni yakunlash"
          )}
        </button>
      ) : null}
      {status === "accepted" || status === "in_progress" ? (
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 active:bg-slate-50 disabled:opacity-50"
        >
          Bekor qilish
        </button>
      ) : null}
    </div>
  );
}
