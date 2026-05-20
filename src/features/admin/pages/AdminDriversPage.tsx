import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { OfflineBanner } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { Pagination } from "../../../components/ui/Pagination";
import { DataTable, DesktopTable, MobileCardList } from "../../../components/ui/Table";
import { createAdminDriver, fetchAdminDrivers } from "../../../services/admin.service";
import type { AdminDriver, CreateDriverPayload, PaginationResponse } from "../lib/types";
import { fullName, getAdminErrorMessage, phoneOf } from "../lib/utils";
import { AdminEmpty, AdminError, AdminLoading } from "../components/AdminState";
import { AdminPageShell } from "../components/AdminPageShell";
import { useOnline } from "../components/useOnline";

const emptyForm: CreateDriverPayload = {
  phone: "",
  name: "",
  car_model: "",
  car_number: "",
  car_color: "",
};

export default function AdminDriversPage() {
  const online = useOnline();
  const [data, setData] = useState<PaginationResponse<AdminDriver> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CreateDriverPayload>(emptyForm);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async (nextPage = page) => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAdminDrivers(nextPage));
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

  async function submit() {
    setSubmitBusy(true);
    setSubmitError(null);
    try {
      await createAdminDriver(form);
      setForm(emptyForm);
      setModalOpen(false);
      await load(1);
    } catch (e: unknown) {
      setSubmitError(getAdminErrorMessage(e));
    } finally {
      setSubmitBusy(false);
    }
  }

  const drivers = data?.results ?? [];

  return (
    <AdminPageShell
      title="Haydovchilar"
      description="Haydovchilar ro‘yxati, avtomobil ma’lumotlari va reytinglar."
      action={<Button onClick={() => setModalOpen(true)}>Yangi haydovchi</Button>}
    >
      {!online ? <OfflineBanner /> : null}
      {loading ? <AdminLoading /> : null}
      {error ? <AdminError message={error} onRetry={() => void load(page)} /> : null}
      {!loading && !error && drivers.length === 0 ? <AdminEmpty title="Haydovchi topilmadi" /> : null}
      {!loading && drivers.length > 0 ? (
        <>
          <MobileCardList>
            {drivers.map((driver) => (
              <div key={driver.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="font-bold text-[#0F3460]">{fullName(driver)}</div>
                <div className="mt-1 text-sm text-slate-500">{phoneOf(driver)}</div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-slate-400">Avtomobil</div>
                    <div className="font-semibold">{driver.car_model || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Raqam</div>
                    <div className="font-semibold">{driver.car_number || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Rang</div>
                    <div className="font-semibold">{driver.car_color || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Reyting</div>
                    <div className="font-semibold">{driver.rating ?? "—"}</div>
                  </div>
                </div>
                <Link
                  to={`/admin/drivers/${driver.id}/reviews`}
                  className="mt-3 inline-flex w-full justify-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-[#1A6BAC]"
                >
                  Reytinglar
                </Link>
              </div>
            ))}
          </MobileCardList>
          <DesktopTable>
            <DataTable columns={["Ism", "Telefon", "Avtomobil", "Rang", "Reyting", "Safarlar", "Amal"]}>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{fullName(driver)}</td>
                  <td className="px-4 py-3 text-slate-600">{phoneOf(driver)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {driver.car_model || "—"} <span className="text-slate-400">{driver.car_number || ""}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{driver.car_color || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-[#FD7E14]">{driver.rating ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{driver.total_trips ?? driver.trips_count ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Link className="text-sm font-bold text-[#1A6BAC] hover:underline" to={`/admin/drivers/${driver.id}/reviews`}>
                      Reytinglar
                    </Link>
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

      <Modal
        open={modalOpen}
        title="Yangi haydovchi"
        onClose={() => setModalOpen(false)}
        footer={
          <div className="flex gap-2">
            <Button className="flex-1" variant="outline" onClick={() => setModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button className="flex-1" disabled={submitBusy} onClick={() => void submit()}>
              Saqlash
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          {submitError ? <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-[#DC3545]">{submitError}</div> : null}
          <Input label="Telefon" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998901234567" />
          <Input label="Ism" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="To‘liq ism" />
          <Input label="Avtomobil modeli" value={form.car_model} onChange={(e) => setForm((f) => ({ ...f, car_model: e.target.value }))} placeholder="Chevrolet Cobalt" />
          <Input label="Davlat raqami" value={form.car_number} onChange={(e) => setForm((f) => ({ ...f, car_number: e.target.value }))} placeholder="01 A 777 AA" />
          <Input label="Rangi" value={form.car_color} onChange={(e) => setForm((f) => ({ ...f, car_color: e.target.value }))} placeholder="Oq" />
        </div>
      </Modal>
    </AdminPageShell>
  );
}
