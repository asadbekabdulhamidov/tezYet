import { useState } from "react";
import type { OrderDetail } from "../../../types/orderDetail";
import { formatSum } from "../../../shared/formatSum";
import { Loader } from "../../../shared/ui/Loader";
import { parseKm, tripDurationLabel } from "./orderScreenUtils";

export function OrderSkeleton() {
  return (
    <div className="px-4 pb-28 pt-2">
      <Loader
        variant="section"
        className="min-h-[65vh] border-0 bg-transparent shadow-none"
        label="Buyurtma yuklanmoqda…"
      />
    </div>
  );
}

export function CompletedHero({
  order,
  onHome,
}: {
  order: OrderDetail;
  onHome: () => void;
}) {
  const income = order.final_price ?? order.estimated_price;
  const km = parseKm(order.distance_km);
  const mins = tripDurationLabel(order);
  const [stars, setStars] = useState(0);

  return (
    <div className="flex min-h-[calc(100dvh-5rem)] flex-col items-center bg-[#F8F9FA] px-4 pb-36 pt-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#1A6BAC] shadow-[0_12px_40px_rgba(26,107,172,0.35)]">
        <span className="text-4xl text-white">✓</span>
      </div>
      <h1 className="mt-6 text-center text-xl font-extrabold text-[#0F3460]">
        Safar muvaffaqiyatli yakunlandi!
      </h1>
      <p className="mt-2 max-w-xs text-center text-sm text-slate-600">
        TezYet Taxi jamoasi sizga rahmat aytadi. Yo&apos;llaringiz osoy bo‘lsin.
      </p>
      <div className="mt-8 grid w-full max-w-sm grid-cols-2 gap-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
          <div className="text-[10px] font-bold uppercase text-slate-400">
            Daromad
          </div>
          <div className="mt-1 text-lg font-extrabold text-[#0F3460]">
            {formatSum(income)}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
          <div className="text-[10px] font-bold uppercase text-slate-400">
            Masofa
          </div>
          <div className="mt-1 text-lg font-extrabold text-[#0F3460]">
            {km > 0 ? `${km.toFixed(1)} km` : "—"}
          </div>
        </div>
      </div>
      <div className="mt-3 w-full max-w-sm rounded-2xl border border-[#1A6BAC]/20 bg-[#1A6BAC]/8 px-4 py-3 text-center">
        <div className="text-[10px] font-bold uppercase text-[#1A6BAC]">
          Safar vaqti
        </div>
        <div className="text-lg font-bold text-[#0F3460]">{mins} daqiqa</div>
      </div>
      <div className="mt-8 w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="text-center text-sm font-bold text-slate-800">
          Mijozni baholang
        </div>
        <div className="mt-3 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              className={`text-2xl transition-transform active:scale-90 ${
                n <= stars ? "text-[#FD7E14]" : "text-slate-200"
              }`}
              aria-label={`${n} yulduz`}
            >
              ★
            </button>
          ))}
        </div>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          MVP: baho keyingi API bilan yuboriladi.
        </p>
      </div>
      <div className="mt-8 h-28 w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 shadow-inner">
        <div className="flex h-full items-center justify-center text-sm font-medium text-slate-500">
          Haydovchi fotosi
        </div>
      </div>
      <button
        type="button"
        onClick={onHome}
        className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-30 mx-auto flex max-w-lg items-center justify-center gap-2 rounded-2xl bg-[#0F3460] py-4 text-base font-bold text-white shadow-xl"
      >
        ⌂ Asosiy ekranga qaytish
      </button>
    </div>
  );
}
