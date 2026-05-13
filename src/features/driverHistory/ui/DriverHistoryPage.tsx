import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDriverHistory } from "../hooks";
import {
  countTripsSince,
  historyStartOfToday,
  historyStartOfWeek,
  pageIncomeSum,
} from "../utils";
import { ROUTES } from "../../../router/routes";
import { OfflineBanner } from "../../../shared/ui/OfflineBanner";
import { EmptyState } from "../../../shared/ui/EmptyState";
import { Button } from "../../../shared/ui/Button";
import { HistoryFilters } from "./HistoryFilters";
import { HistorySkeleton } from "./HistorySkeleton";
import { TripCard } from "./TripCard";
import { Loader } from "../../../shared/ui/Loader";
import { formatSum } from "../../../shared/formatSum";

export default function DriverHistoryPage() {
  const nav = useNavigate();
  const online = useOnline();

  const {
    items,
    rawItems,
    isLoading,
    error,
    page,
    count,
    next,
    previous,
    loadNext,
    loadPrev,
    refetch,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    hasDates,
  } = useDriverHistory();

  const stats = useMemo(() => {
    return {
      income: pageIncomeSum(rawItems),
      today: countTripsSince(rawItems, historyStartOfToday()),
      week: countTripsSince(rawItems, historyStartOfWeek()),
    };
  }, [rawItems]);

  return (
    <div className="min-h-dvh bg-[#F8F9FA] pb-28">
      {!online ? <OfflineBanner /> : null}

      <header className="sticky top-0 z-20 border-b border-slate-100/90 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-start justify-between gap-2">
          <div>
            <button
              type="button"
              onClick={() => nav(-1)}
              className="mb-1 text-lg text-slate-600 hover:text-[#0F3460]"
              aria-label="Orqaga"
            >
              ←
            </button>
            <h1 className="text-lg font-extrabold text-[#0F3460]">
              Mening safarlarim
            </h1>
            <p className="text-xs text-slate-500">O&apos;tgan safarlar tarixi</p>
          </div>
          <div className="flex items-center gap-2 pt-1">
            {!online ? (
              <button
                type="button"
                onClick={() => void refetch()}
                className="text-xs font-bold text-[#1A6BAC] underline"
              >
                Qayta urinish
              </button>
            ) : null}
            <span className="text-xl text-slate-400" aria-hidden>
              ⚙
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 pt-4">
        {!isLoading && !error && rawItems.length === 0 ? (
          <EmptyState
            title="Hozircha safarlar yo‘q"
            description="Safarlar tugagach shu yerda ko‘rinadi."
            actionLabel="Asosiy ekranga qaytish"
            onAction={() => nav(ROUTES.driverHome)}
          />
        ) : null}

        {isLoading && rawItems.length === 0 ? <HistorySkeleton /> : null}

        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
            {error}
            <Button className="mt-3 w-full" onClick={() => void refetch()}>
              Qayta yuklash
            </Button>
          </div>
        ) : null}

        {!isLoading && rawItems.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1 rounded-2xl bg-[#0F3460] p-3 text-white shadow-md">
                <div className="text-[10px] font-bold uppercase text-white/80">
                  Umumiy daromad
                </div>
                <div className="mt-1 text-lg font-extrabold leading-tight">
                  {formatSum(stats.income)}
                </div>
                <div className="mt-1 text-[9px] text-white/70">Joriy sahifa</div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                <div className="text-xl" aria-hidden>
                  📅
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase text-slate-400">
                  Bugun
                </div>
                <div className="text-base font-extrabold text-[#0F3460]">
                  {stats.today} ta
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-3 text-center shadow-sm">
                <div className="text-xl" aria-hidden>
                  📆
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase text-slate-400">
                  Hafta
                </div>
                <div className="text-base font-extrabold text-[#0F3460]">
                  {stats.week} ta
                </div>
              </div>
            </div>

            <div className="mt-4">
              <HistoryFilters
                status={statusFilter}
                time={timeFilter}
                hasDates={hasDates}
                onStatus={setStatusFilter}
                onTime={setTimeFilter}
              />
            </div>

            {!online && rawItems.length > 0 ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                <div className="font-bold">Keshdagi ma’lumotlar</div>
                <p className="mt-1 text-amber-900/90">
                  Faqat oxirgi yuklangan sahifa ko‘rsatilmoqda. Yangilanish uchun
                  internet kerak.
                </p>
                <Button
                  variant="outline"
                  className="mt-2 w-full"
                  onClick={() => void refetch()}
                  disabled={isLoading}
                >
                  Qayta yuklash
                </Button>
              </div>
            ) : null}

            {items.length === 0 && rawItems.length > 0 ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
                Tanlangan filtrlarga mos safar yo‘q.
                <div className="mt-3 flex justify-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStatusFilter("all");
                      setTimeFilter("all");
                    }}
                  >
                    Filtrlarni tozalash
                  </Button>
                </div>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {items.map((it) => (
                  <li key={it.id}>
                    <TripCard item={it} />
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 pt-4 text-xs text-slate-600">
              <span>
                Jami: <strong>{count}</strong> | Sahifa:{" "}
                <strong>{page}</strong>
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="!px-3 !py-2 text-xs"
                  disabled={!previous || isLoading}
                  onClick={() => void loadPrev()}
                >
                  ← Oldingi
                </Button>
                <Button
                  variant="outline"
                  className="!px-3 !py-2 text-xs"
                  disabled={!next || isLoading}
                  onClick={() => void loadNext()}
                >
                  Keyingi →
                </Button>
              </div>
            </div>
          </>
        ) : null}

        {isLoading && rawItems.length > 0 ? (
          <div className="mt-4 flex justify-center py-2">
            <Loader variant="inline" label="Yangilanmoqda…" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function useOnline(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}
