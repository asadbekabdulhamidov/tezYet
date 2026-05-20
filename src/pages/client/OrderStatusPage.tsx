import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { cancelClientOrder, fetchClientOrder } from "../../services/client-orders.service";
import type { OrderDetail } from "../../types/orderDetail";
import { formatSum } from "../../shared/formatSum";
import { Loader } from "../../shared/ui/Loader";

function statusClass(status: string) {
  if (status === "completed") return "bg-[#28A745]/10 text-[#28A745]";
  if (status === "cancelled") return "bg-[#DC3545]/10 text-[#DC3545]";
  if (status === "accepted") return "bg-[#1A6BAC]/10 text-[#1A6BAC]";
  if (status === "in_progress") return "bg-[#6F42C1]/10 text-[#6F42C1]";
  return "bg-[#FD7E14]/10 text-[#FD7E14]";
}

export default function OrderStatusPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const orderId = Number(id);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(orderId)) {
      setError("Buyurtma topilmadi.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setOrder(await fetchClientOrder(orderId));
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(String(detail || "Buyurtmani yuklab bo‘lmadi."));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    if (!order || ["completed", "cancelled"].includes(String(order.status))) return;
    const id = window.setInterval(() => {
      void load();
    }, 5000);
    return () => window.clearInterval(id);
  }, [load, order]);

  async function onCancel() {
    if (!Number.isFinite(orderId)) return;
    if (!window.confirm("Buyurtmani bekor qilasizmi?")) return;
    setBusy(true);
    setError(null);
    try {
      await cancelClientOrder(orderId);
      await load();
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(String(detail || "Bekor qilib bo‘lmadi."));
    } finally {
      setBusy(false);
    }
  }

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
              Buyurtma holati
            </div>
            <h1 className="text-lg font-extrabold text-[#0F3460]">
              #{Number.isFinite(orderId) ? orderId : "—"}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {loading ? (
          <Loader variant="section" label="Buyurtma yuklanmoqda..." />
        ) : error ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-[#DC3545]">
            {error}
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 w-full rounded-xl bg-[#0F3460] py-3 font-bold text-white"
            >
              Qayta urinish
            </button>
          </div>
        ) : order ? (
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-[#0F3460]">
                    {order.from_address}
                  </div>
                  <div className="my-2 h-6 w-px bg-slate-200" />
                  <div className="text-sm font-bold text-[#0F3460]">
                    {order.to_address}
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${statusClass(String(order.status))}`}>
                  {order.status_display || order.status}
                </span>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Taxminiy narx</div>
                <div className="mt-1 font-extrabold text-[#0F3460]">
                  {formatSum(order.estimated_price)}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="text-xs text-slate-500">Masofa</div>
                <div className="mt-1 font-extrabold text-[#0F3460]">
                  {order.distance_km ?? "—"} km
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
              <h2 className="font-extrabold text-[#0F3460]">Haydovchi</h2>
              <div className="mt-2 text-slate-600">
                {order.driver_name || "Haydovchi hali biriktirilmagan."}
              </div>
              {order.driver_phone ? (
                <a className="mt-2 block font-bold text-[#1A6BAC]" href={`tel:${order.driver_phone}`}>
                  {order.driver_phone}
                </a>
              ) : null}
              {order.driver_car ? (
                <div className="mt-2 text-slate-600">
                  {order.driver_car} {order.driver_car_color ? `- ${order.driver_car_color}` : ""}
                </div>
              ) : null}
            </section>

            {!["completed", "cancelled"].includes(String(order.status)) ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => void onCancel()}
                className="w-full rounded-xl bg-[#DC3545] py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy ? "Bekor qilinmoqda..." : "Buyurtmani bekor qilish"}
              </button>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}
