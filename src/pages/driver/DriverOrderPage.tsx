import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import {
  cancelOrder,
  completeOrder,
  fetchOrder,
  startOrder,
} from "../../services/orders.service";
import type { OrderDetail, OrderStatus } from "../../types/orderDetail";
import { useOrderDetailSocket } from "../../hooks/useOrderDetailSocket";
import { ROUTES } from "../../router/routes";
import { headerBadge } from "./order/orderScreenUtils";
import { MapHero } from "./order/MapHero";
import {
  ActionBar,
  CustomerCard,
  RideStatusFloat,
  RouteBlock,
  TripTimeline,
} from "./order/OrderPanels";
import { CompletedHero, OrderSkeleton } from "./order/OrderCompleted";

const MOCK_ACCESS = "dev-access-token";

export default function DriverOrderPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const orderId = id ? parseInt(id, 10) : NaN;
  const isMock = accessToken === MOCK_ACCESS;

  const [online, setOnline] = useState(() => navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const applyPatch = useCallback((patch: Partial<OrderDetail>) => {
    setOrder((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const load = useCallback(async () => {
    if (!orderId || Number.isNaN(orderId)) {
      setLoading(false);
      setErr("Noto‘g‘ri buyurtma.");
      return;
    }
    if (!online) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const o = await fetchOrder(orderId);
      setOrder(o);
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      setErr(String(d || "Buyurtmani yuklab bo‘lmadi."));
    } finally {
      setLoading(false);
    }
  }, [orderId, online]);

  useEffect(() => {
    void load();
  }, [load]);

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

  useEffect(() => {
    if (!online || !order) return;
    const st = order.status as OrderStatus;
    if (!["pending", "accepted", "in_progress"].includes(st)) return;
    const t = window.setInterval(() => {
      void load();
    }, 5000);
    return () => window.clearInterval(t);
  }, [online, order?.status, load, order]);

  useOrderDetailSocket(
    Number.isFinite(orderId) ? orderId : null,
    accessToken,
    online && !isMock && Number.isFinite(orderId),
    applyPatch,
  );

  async function handleStart() {
    if (!orderId || Number.isNaN(orderId)) return;
    setBusy(true);
    setActionMsg(null);
    try {
      await startOrder(orderId);
      await load();
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      setActionMsg(String(d || "Boshlashda xato."));
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete() {
    if (!orderId || Number.isNaN(orderId)) return;
    setBusy(true);
    setActionMsg(null);
    try {
      await completeOrder(orderId);
      await load();
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      setActionMsg(String(d || "Yakunlashda xato."));
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!orderId || Number.isNaN(orderId)) return;
    if (
      !window.confirm(
        "Buyurtmani bekor qilasizmi? Bu amalni qaytarib bo‘lmaydi.",
      )
    ) {
      return;
    }
    setBusy(true);
    setActionMsg(null);
    try {
      await cancelOrder(orderId);
      await load();
    } catch (e: unknown) {
      const d = (e as { response?: { data?: { detail?: string } } })?.response
        ?.data?.detail;
      setActionMsg(String(d || "Bekor qilishda xato."));
    } finally {
      setBusy(false);
    }
  }

  const status = (order?.status ?? "pending") as OrderStatus;
  const badge = headerBadge(status);

  if (!Number.isFinite(orderId)) {
    return (
      <div className="min-h-dvh bg-[#F8F9FA] px-4 py-10 text-center text-slate-600">
        Buyurtma topilmadi.
        <button
          type="button"
          onClick={() => nav(ROUTES.driverHome)}
          className="mt-4 w-full max-w-sm rounded-xl bg-[#0F3460] py-3 font-semibold text-white"
        >
          Asosiy
        </button>
      </div>
    );
  }

  if (loading && online && !order) {
    return (
      <div className="min-h-dvh bg-[#F8F9FA]">
        <OrderSkeleton />
      </div>
    );
  }

  if (err && !order) {
    return (
      <div className="min-h-dvh bg-[#F8F9FA] px-4 py-10">
        <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
          {err}
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 w-full rounded-xl bg-[#0F3460] py-2.5 font-semibold text-white"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-dvh bg-[#F8F9FA] px-4 py-10 text-center text-slate-600">
        {!online ? "Internet yo‘q. Ulaning va qayta urinib ko‘ring." : "—"}
        <button
          type="button"
          onClick={() => void load()}
          className="mt-4 w-full max-w-sm rounded-xl bg-[#0F3460] py-3 font-semibold text-white"
        >
          Yangilash
        </button>
      </div>
    );
  }

  if (status === "completed") {
    return (
      <CompletedHero
        order={order}
        onHome={() => nav(ROUTES.driverHome, { replace: true })}
      />
    );
  }

  if (status === "cancelled") {
    return (
      <div className="min-h-dvh bg-[#F8F9FA] px-4 py-12 text-center">
        <p className="text-lg font-bold text-[#DC3545]">Buyurtma bekor qilindi</p>
        <p className="mt-2 text-sm text-slate-600">{order.status_display}</p>
        <button
          type="button"
          onClick={() => nav(ROUTES.driverHome, { replace: true })}
          className="mt-8 w-full max-w-sm rounded-2xl bg-[#0F3460] py-3.5 font-bold text-white"
        >
          Asosiy ekranga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#F8F9FA] pb-32">
      {!online ? (
        <div className="bg-[#FD7E14] px-4 py-2 text-center text-sm font-semibold text-white">
          Internet mavjud emas
        </div>
      ) : null}

      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-slate-100/90 bg-white/95 px-2 py-2.5 backdrop-blur">
        <button
          type="button"
          onClick={() => nav(ROUTES.driverHome)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg text-slate-700 hover:bg-slate-50"
          aria-label="Orqaga"
        >
          ←
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-medium text-slate-500">
            Aktiv safar
          </div>
          <div className="truncate text-sm font-bold text-[#0F3460]">
            #{order.id}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-bold tracking-wide ${badge.className}`}
        >
          {badge.text}
        </span>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg text-slate-600 hover:bg-slate-50"
          aria-label="Bildirishnoma"
        >
          🔔
        </button>
      </header>

      <MapHero order={order} />
      <RideStatusFloat order={order} status={status} />
      <CustomerCard order={order} />
      <RouteBlock order={order} />

      {actionMsg ? (
        <div className="mx-4 mt-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-800">
          {actionMsg}
        </div>
      ) : null}

      <TripTimeline status={status} />
      <ActionBar
        status={status}
        busy={busy}
        onStart={handleStart}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}
