import { useCallback, useEffect, useState } from "react";
import { OfflineBanner } from "../../../components/ui/Alert";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { Pagination } from "../../../components/ui/Pagination";
import { Select } from "../../../components/ui/Select";
import {
  DataTable,
  DesktopTable,
  MobileCardList,
} from "../../../components/ui/Table";
import { Loader } from "../../../shared/ui/Loader";
import {
  createAdminOrder,
  estimateAdminOrder,
  fetchAdminOrders,
} from "../../../services/admin.service";
import type { EstimateResult } from "../../../services/client-orders.service";
import type {
  AdminOrder,
  AdminOrderStatus,
  PaginationResponse,
} from "../lib/types";
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

type OrderForm = {
  from_address: string;
  from_lat: string;
  from_lon: string;
  to_address: string;
  to_lat: string;
  to_lon: string;
  comment: string;
};

const statuses: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "Barchasi" },
  { value: "pending", label: "Kutilmoqda" },
  { value: "accepted", label: "Qabul qilingan" },
  { value: "in_progress", label: "Yo‘lda" },
  { value: "completed", label: "Yakunlangan" },
  { value: "cancelled", label: "Bekor qilingan" },
];

const emptyOrderForm: OrderForm = {
  from_address: "Sayram markazi",
  from_lat: "42.308800",
  from_lon: "69.737200",
  to_address: "Shymkent markazi",
  to_lat: "42.340000",
  to_lon: "69.600000",
  comment: "",
};

export default function AdminOrdersPage() {
  const online = useOnline();
  const [data, setData] = useState<PaginationResponse<AdminOrder> | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<FilterStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<OrderForm>(emptyOrderForm);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [estimateBusy, setEstimateBusy] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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

  function patchForm<K extends keyof OrderForm>(key: K, value: OrderForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setEstimate(null);
    setCreateError(null);
  }

  function orderFormMissing() {
    return (
      !form.from_address.trim() ||
      !form.from_lat.trim() ||
      !form.from_lon.trim() ||
      !form.to_address.trim() ||
      !form.to_lat.trim() ||
      !form.to_lon.trim()
    );
  }

  async function onEstimate() {
    setEstimateBusy(true);
    setCreateError(null);
    try {
      const result = await estimateAdminOrder({
        from_lat: form.from_lat,
        from_lon: form.from_lon,
        to_lat: form.to_lat,
        to_lon: form.to_lon,
      });
      setEstimate(result);
    } catch (e: unknown) {
      setCreateError(getAdminErrorMessage(e));
    } finally {
      setEstimateBusy(false);
    }
  }

  async function onCreateOrder() {
    setCreateBusy(true);
    setCreateError(null);
    try {
      const order = await createAdminOrder({
        ...form,
        comment: form.comment.trim() || undefined,
      });
      setForm(emptyOrderForm);
      setEstimate(null);
      setCreateOpen(false);
      setSelected(order);
      await load(1, status);
    } catch (e: unknown) {
      setCreateError(getAdminErrorMessage(e));
    } finally {
      setCreateBusy(false);
    }
  }

  return (
    <AdminPageShell
      title="Buyurtmalar"
      description="Barcha buyurtmalar, status filtri va yangi buyurtma yaratish."
      action={
        <div className="flex flex-wrap gap-2">
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
          <Button onClick={() => setCreateOpen(true)}>Yangi buyurtma</Button>
        </div>
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
                    <div className="font-semibold">
                      {formatMoney(order.final_price ?? order.estimated_price)}
                    </div>
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
                  <td className="px-4 py-3 text-slate-600">
                    {formatMoney(order.final_price ?? order.estimated_price)}
                  </td>
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

      <Modal
        open={createOpen}
        title="Yangi buyurtma"
        onClose={() => setCreateOpen(false)}
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => void onEstimate()}
              disabled={estimateBusy || createBusy || orderFormMissing()}
            >
              {estimateBusy ? <Loader variant="button" /> : null}
              Narx
            </Button>
            <Button
              onClick={() => void onCreateOrder()}
              disabled={createBusy || orderFormMissing()}
            >
              {createBusy ? <Loader variant="button" tone="onDark" /> : null}
              Yaratish
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {createError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm text-[#DC3545]">
              {createError}
            </div>
          ) : null}

          <section className="space-y-3">
            <h3 className="text-sm font-extrabold text-[#0F3460]">Qayerdan?</h3>
            <Input
              label="Manzil"
              value={form.from_address}
              onChange={(e) => patchForm("from_address", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Latitude"
                inputMode="decimal"
                value={form.from_lat}
                onChange={(e) => patchForm("from_lat", e.target.value)}
              />
              <Input
                label="Longitude"
                inputMode="decimal"
                value={form.from_lon}
                onChange={(e) => patchForm("from_lon", e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-extrabold text-[#0F3460]">Qayerga?</h3>
            <Input
              label="Manzil"
              value={form.to_address}
              onChange={(e) => patchForm("to_address", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Latitude"
                inputMode="decimal"
                value={form.to_lat}
                onChange={(e) => patchForm("to_lat", e.target.value)}
              />
              <Input
                label="Longitude"
                inputMode="decimal"
                value={form.to_lon}
                onChange={(e) => patchForm("to_lon", e.target.value)}
              />
            </div>
          </section>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-600">
              Izoh
            </span>
            <textarea
              value={form.comment}
              onChange={(e) => patchForm("comment", e.target.value)}
              placeholder="Masalan: mijoz kirish oldida kutadi"
              className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1A6BAC] focus:ring-2 focus:ring-[#1A6BAC]/15"
            />
          </label>

          {estimate ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Masofa</div>
                <div className="font-bold text-[#0F3460]">
                  {estimate.distance_km} km
                </div>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-xs text-slate-500">Taxminiy narx</div>
                <div className="font-bold text-[#0F3460]">
                  {formatMoney(estimate.estimated_price)}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </AdminPageShell>
  );
}
