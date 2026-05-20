import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { OfflineBanner } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { fetchAdminDrivers, fetchAdminOrders, fetchAdminUsers } from "../../../services/admin.service";
import { ROUTES } from "../../../router/routes";
import type { AdminDriver, AdminOrder, AdminUser } from "../lib/types";
import { getAdminErrorMessage } from "../lib/utils";
import { AdminError, AdminLoading } from "../components/AdminState";
import { AdminPageShell } from "../components/AdminPageShell";
import { useOnline } from "../components/useOnline";

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-extrabold text-[#0F3460]">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  );
}

export default function AdminDashboardPage() {
  const online = useOnline();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [drivers, setDrivers] = useState<AdminDriver[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [counts, setCounts] = useState({ users: 0, drivers: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, d, o] = await Promise.all([
        fetchAdminUsers(1),
        fetchAdminDrivers(1),
        fetchAdminOrders({ page: 1, status: "all" }),
      ]);
      setUsers(u.results);
      setDrivers(d.results);
      setOrders(o.results);
      setCounts({ users: u.count, drivers: d.count, orders: o.count });
    } catch (e: unknown) {
      setError(getAdminErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const pending = useMemo(
    () => orders.filter((o) => o.status === "pending").length,
    [orders],
  );

  const completedToday = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter(
      (o) =>
        o.status === "completed" &&
        o.completed_at &&
        new Date(o.completed_at).toDateString() === today,
    ).length;
  }, [orders]);

  return (
    <AdminPageShell
      title="Dashboard"
      description="Birinchi sahifa ma’lumotlari asosida taxminiy ko‘rsatkichlar."
    >
      {!online ? <OfflineBanner /> : null}
      {loading ? <AdminLoading /> : null}
      {error ? <AdminError message={error} onRetry={() => void load()} /> : null}
      {!loading && !error ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Foydalanuvchilar" value={counts.users} />
            <StatCard label="Haydovchilar" value={counts.drivers} />
            <StatCard label="Buyurtmalar" value={counts.orders} />
            <StatCard label="Kutilayotgan" value={pending} hint="Taxminiy" />
            <StatCard label="Bugun yakunlangan" value={completedToday} hint="Taxminiy" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <Link className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" to={ROUTES.adminDrivers}>
              <div className="text-sm font-bold text-[#0F3460]">Haydovchilar</div>
              <p className="mt-1 text-xs text-slate-500">Ro‘yxat va yangi haydovchi yaratish.</p>
              <Button className="mt-4 w-full" variant="outline">Ochish</Button>
            </Link>
            <Link className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" to={ROUTES.adminUsers}>
              <div className="text-sm font-bold text-[#0F3460]">Foydalanuvchilar</div>
              <p className="mt-1 text-xs text-slate-500">Faollashtirish yoki bloklash.</p>
              <Button className="mt-4 w-full" variant="outline">Ochish</Button>
            </Link>
            <Link className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" to={ROUTES.adminOrders}>
              <div className="text-sm font-bold text-[#0F3460]">Buyurtmalar</div>
              <p className="mt-1 text-xs text-slate-500">Status bo‘yicha kuzatish.</p>
              <Button className="mt-4 w-full" variant="outline">Ochish</Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            Oxirgi yuklangan: {users.length} foydalanuvchi, {drivers.length} haydovchi, {orders.length} buyurtma.
          </div>
        </>
      ) : null}
    </AdminPageShell>
  );
}
