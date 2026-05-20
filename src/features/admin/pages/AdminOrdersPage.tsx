import { useCallback, useEffect, useState } from "react";
import { OfflineBanner } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { Pagination } from "../../../components/ui/Pagination";
import { Select } from "../../../components/ui/Select";
import { DataTable, DesktopTable, MobileCardList } from "../../../components/ui/Table";
import { fetchAdminOrders } from "../../../services/admin.service";
import type { AdminOrder, AdminOrderStatus, PaginationResponse } from "../lib/types";
import {
  formatDate,
  formatMoney,
  getAdminErrorMessage,
  orderClient,
  orderClientPhone,
  orderDriver,
  statusLabel,
  statusTone,
} from "../lib/utils";
import { AdminEmpty, AdminError, AdminLoading } from "../components/AdminState";
import { AdminPageShell } from "../components/AdminPageShell";
import { useOnline } from "../components/useOnline";

type FilterStatus = AdminOrderStatus | "all";

const statuses: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "Barchasi" },
  { value: "pending", label: "Kutilmoqda" },
  { value: "accepted", label: "Qabul qilingan" },
  { value: "in_progress", label: "Yo‘lda" },
  { value: "completed", label: "Yakunlangan" },
  { value: "cancelled", label: "Bekor qilingan" },
];

export default function AdminOrdersPage() {
  const online = useOnline();
  const [data, setData] = useState<PaginationResponse<AdminOrder> | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminOrder | null>(null);

  const load = useCallback(
    async (nextPage = page, nextStatus = status) => {
      setLoading(true);
      setError(null);
      try {
        setData(await fetchAdminOrders({ page: nextPage, status: nextStatus }));
        setPage(nextPage);
      } catch (e: unknown) {
        setError(getAdminErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [page, status],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load(1, status);
    }, 0);
    return () => window.clearTimeout(id);
  }, [load, status]);

  const orders = data?.results ?? [];

  return (
    <AdminPageShell
      title="Buyurtmalar"
      description="Barcha buyurtmalar va status bo‘yicha filtrlash."
      action={
        <Select
          value={status}
          onChange={(e) => {
            const next = e.target.value as FilterStatus;
            setStatus(next);
            setPage(1);
          }}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      }
    >
      {!online ? <OfflineBanner /> : null}
      {loading ? <AdminLoading /> : null}
      {error ? <AdminError message={error} onRetry={() => void load(page, status)} /> : null}
      {!loading && !error && orders.length === 0 ? <AdminEmpty title="Buyurtma topilmadi" /> : null}
      {!loading && orders.length > 0 ? (
        <>
          <MobileCardList>
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelected(order)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-bold text-[#0F3460]">#{order.id}</div>
                  <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
                </div>
                <div className="mt-3 text-sm">
                  <div className="font-semibold text-slate-800">{orderClient(order)}</div>
                  <div className="text-slate-500">{orderClientPhone(order)}</div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-slate-400">Haydovchi</div>
                    <div className="font-semibold">{orderDriver(order)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Narx</div>
                    <div className="font-semibold">{formatMoney(order.final_price ?? order.estimated_price)}</div>
                  </div>
                </div>
              </button>
            ))}
          </MobileCardList>
          <DesktopTable>
            <DataTable columns={["ID", "Status", "Mijoz", "Haydovchi", "Narx", "Masofa", "Sana"]}>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => setSelected(order)}
                >
                  <td className="px-4 py-3 font-bold text-[#0F3460]">#{order.id}</td>
                  <td className="px-4 py-3">
                    <Badge tone={statusTone(order.status)}>{statusLabel(order.status)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{orderClient(order)}</div>
                    <div className="text-xs text-slate-500">{orderClientPhone(order)}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{orderDriver(order)}</td>
                  <td className="px-4 py-3 text-slate-600">{formatMoney(order.final_price ?? order.estimated_price)}</td>
                  <td className="px-4 py-3 text-slate-600">{order.distance_km ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(order.created_at)}</td>
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
              onNext={() => void load(page + 1, status)}
              onPrevious={() => void load(Math.max(1, page - 1), status)}
            />
          ) : null}
        </>
      ) : null}

      <Modal open={!!selected} title="Buyurtma tafsiloti" onClose={() => setSelected(null)}>
        <pre className="max-h-[55dvh] overflow-auto rounded-xl bg-slate-950 p-3 text-xs text-slate-100">
          {JSON.stringify(selected, null, 2)}
        </pre>
      </Modal>
    </AdminPageShell>
  );
}
