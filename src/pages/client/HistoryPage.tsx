import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchClientOrders } from "../../services/client-orders.service";
import type { DriverAvailableOrder } from "../../types/order";
import { formatSum } from "../../shared/formatSum";
import { Loader } from "../../shared/ui/Loader";

export default function HistoryPage() {
  const nav = useNavigate();
  const [orders, setOrders] = useState<DriverAvailableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await fetchClientOrders());
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(String(detail || "Buyurtmalarni yuklab bo‘lmadi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return (
    <div className="min-h-dvh bg-[#F8F9FA]">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3">
          <button
            type="button"
            onClick={() => nav("/")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
          >
            ←
          </button>
          <div>
            <div className="text-xs font-bold uppercase text-[#1A6BAC]">
              Mijoz
            </div>
            <h1 className="text-lg font-extrabold text-[#0F3460]">
              Buyurtmalar tarixi
            </h1>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-lg px-4 py-4">
        {loading ? <Loader variant="section" label="Yuklanmoqda..." /> : null}
        {error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-[#DC3545]">
            {error}
          </div>
        ) : null}
        {!loading && !error && orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-500">
            Hozircha buyurtmalar yo‘q.
          </div>
        ) : null}
        <div className="space-y-3">
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => nav(`/order/${order.id}`)}
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-bold text-[#0F3460]">#{order.id}</div>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-600">
                  {order.status_display || order.status}
                </span>
              </div>
              <div className="mt-3 text-sm font-semibold text-slate-900">
                {order.from_address}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                {order.to_address}
              </div>
              <div className="mt-3 text-sm font-bold text-[#0F3460]">
                {formatSum(order.final_price ?? order.estimated_price)}
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
