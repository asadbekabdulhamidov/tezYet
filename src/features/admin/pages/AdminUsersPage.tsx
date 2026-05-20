import { useCallback, useEffect, useState } from "react";
import { OfflineBanner } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Pagination } from "../../../components/ui/Pagination";
import { DataTable, DesktopTable, MobileCardList } from "../../../components/ui/Table";
import { fetchAdminUsers, toggleAdminUserActive } from "../../../services/admin.service";
import type { AdminUser, PaginationResponse } from "../lib/types";
import { fullName, getAdminErrorMessage, isActive, phoneOf } from "../lib/utils";
import { AdminEmpty, AdminError, AdminLoading } from "../components/AdminState";
import { AdminPageShell } from "../components/AdminPageShell";
import { useOnline } from "../components/useOnline";

export default function AdminUsersPage() {
  const online = useOnline();
  const [data, setData] = useState<PaginationResponse<AdminUser> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async (nextPage = page) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAdminUsers(nextPage));
      setPage(nextPage);
    } catch (e: unknown) {
      setError(getAdminErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load(1);
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  async function toggleUser(user: AdminUser) {
    const previous = data;
    if (!previous) return;
    setBusyId(user.id);
    const nextActive = !isActive(user);
    setData({
      ...previous,
      results: previous.results.map((u) =>
        u.id === user.id ? { ...u, is_active: nextActive, is_blocked: !nextActive } : u,
      ),
    });
    try {
      const updated = await toggleAdminUserActive(user.id);
      if (updated) {
        setData((current) =>
          current
            ? {
                ...current,
                results: current.results.map((u) => (u.id === user.id ? { ...u, ...updated } : u)),
              }
            : current,
        );
      }
    } catch (e: unknown) {
      setData(previous);
      setError(getAdminErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  const users = data?.results ?? [];

  return (
    <AdminPageShell title="Foydalanuvchilar" description="Mijoz, haydovchi va admin akkauntlari.">
      {!online ? <OfflineBanner /> : null}
      {loading ? <AdminLoading /> : null}
      {error ? <AdminError message={error} onRetry={() => void load(page)} /> : null}
      {!loading && !error && users.length === 0 ? <AdminEmpty title="Foydalanuvchi topilmadi" /> : null}
      {!loading && users.length > 0 ? (
        <>
          <MobileCardList>
            {users.map((user) => (
              <div key={user.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-[#0F3460]">{fullName(user)}</div>
                    <div className="mt-1 text-sm text-slate-500">{phoneOf(user)}</div>
                  </div>
                  <Badge tone={isActive(user) ? "success" : "danger"}>
                    {isActive(user) ? "Faol" : "Blok"}
                  </Badge>
                </div>
                <div className="mt-3 text-xs font-semibold uppercase text-slate-400">{user.role || "—"}</div>
                <Button
                  className="mt-3 w-full"
                  variant={isActive(user) ? "danger" : "secondary"}
                  disabled={busyId === user.id}
                  onClick={() => void toggleUser(user)}
                >
                  {isActive(user) ? "Bloklash" : "Faollashtirish"}
                </Button>
              </div>
            ))}
          </MobileCardList>
          <DesktopTable>
            <DataTable columns={["Ism", "Telefon", "Rol", "Status", "Amal"]}>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{fullName(user)}</td>
                  <td className="px-4 py-3 text-slate-600">{phoneOf(user)}</td>
                  <td className="px-4 py-3 text-slate-600">{user.role || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={isActive(user) ? "success" : "danger"}>
                      {isActive(user) ? "Faol" : "Blok"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      className="px-3 py-2 text-xs"
                      variant={isActive(user) ? "danger" : "secondary"}
                      disabled={busyId === user.id}
                      onClick={() => void toggleUser(user)}
                    >
                      {isActive(user) ? "Bloklash" : "Faollashtirish"}
                    </Button>
                  </td>
                </tr>
              ))}
            </DataTable>
          </DesktopTable>
          {data ? (
            <Pagination
              count={data.count}
              page={page}
              hasNext={!!data.next}
              hasPrevious={!!data.previous}
              isLoading={loading}
              onNext={() => void load(page + 1)}
              onPrevious={() => void load(Math.max(1, page - 1))}
            />
          ) : null}
        </>
      ) : null}
    </AdminPageShell>
  );
}
