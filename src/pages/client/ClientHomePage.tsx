import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClientOrder, estimateClientOrder } from "../../services/client-orders.service";
import { clearAuth } from "../../store/auth/authSlice";
import { useAppDispatch } from "../../store/hooks";
import { formatSum } from "../../shared/formatSum";
import { Loader } from "../../shared/ui/Loader";

type FormState = {
  from_address: string;
  from_lat: string;
  from_lon: string;
  to_address: string;
  to_lat: string;
  to_lon: string;
  comment: string;
};

const initialForm: FormState = {
  from_address: "Sayram markazi",
  from_lat: "42.308800",
  from_lon: "69.737200",
  to_address: "Shymkent markazi",
  to_lat: "42.340000",
  to_lon: "69.600000",
  comment: "",
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-slate-600">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1A6BAC] focus:ring-2 focus:ring-[#1A6BAC]/15"
      />
    </label>
  );
}

export default function ClientHomePage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [form, setForm] = useState<FormState>(initialForm);
  const [busy, setBusy] = useState(false);
  const [estimateBusy, setEstimateBusy] = useState(false);
  const [estimate, setEstimate] = useState<{ distance_km: string | number; estimated_price: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function requiredMissing() {
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
    setError(null);
    setMessage(null);
    try {
      const data = await estimateClientOrder({
        from_lat: form.from_lat,
        from_lon: form.from_lon,
        to_lat: form.to_lat,
        to_lon: form.to_lon,
      });
      setEstimate(data);
      setMessage("Narx taxmini hisoblandi.");
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(String(detail || "Narxni hisoblab bo‘lmadi."));
    } finally {
      setEstimateBusy(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const order = await createClientOrder({
        ...form,
        comment: form.comment.trim() || undefined,
      });
      setMessage("Buyurtma yaratildi. Haydovchi kutilmoqda.");
      nav(`/order/${order.id}`, { replace: true });
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status;
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (status === 409) {
        setError("Sizda aktiv buyurtma mavjud. Avval uni yakunlang yoki bekor qiling.");
      } else if (status === 403) {
        setError("Siz bu amalni bajara olmaysiz.");
      } else if (!navigator.onLine) {
        setError("Internet yo‘q.");
      } else {
        setError(String(detail || "Buyurtma yaratishda xatolik."));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#F8F9FA]">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase text-[#1A6BAC]">
              TezYet Taxi
            </div>
            <h1 className="text-lg font-extrabold text-[#0F3460]">
              Yangi buyurtma
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => nav("/history")}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
            >
              Tarix
            </button>
            <button
              type="button"
              onClick={() => dispatch(clearAuth())}
              className="rounded-xl bg-[#DC3545] px-3 py-2 text-xs font-bold text-white"
            >
              Chiqish
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-4">
        {!navigator.onLine ? (
          <div className="mb-4 rounded-xl bg-[#FD7E14] px-3 py-2 text-center text-sm font-bold text-white">
            Internet yo‘q
          </div>
        ) : null}

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-[#DC3545]">
            {error}
          </div>
        ) : null}
        {message ? (
          <div className="mb-4 rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-[#28A745]">
            {message}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#0F3460]">
              Qayerdan?
            </h2>
            <div className="mt-3 space-y-3">
              <Field label="Manzil" value={form.from_address} onChange={(v) => patch("from_address", v)} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Latitude" value={form.from_lat} onChange={(v) => patch("from_lat", v)} inputMode="decimal" />
                <Field label="Longitude" value={form.from_lon} onChange={(v) => patch("from_lon", v)} inputMode="decimal" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-extrabold text-[#0F3460]">
              Qayerga?
            </h2>
            <div className="mt-3 space-y-3">
              <Field label="Manzil" value={form.to_address} onChange={(v) => patch("to_address", v)} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Latitude" value={form.to_lat} onChange={(v) => patch("to_lat", v)} inputMode="decimal" />
                <Field label="Longitude" value={form.to_lon} onChange={(v) => patch("to_lon", v)} inputMode="decimal" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-slate-600">
                Izoh
              </span>
              <textarea
                value={form.comment}
                onChange={(e) => patch("comment", e.target.value)}
                placeholder="Masalan: kirish oldida kutaman"
                className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1A6BAC] focus:ring-2 focus:ring-[#1A6BAC]/15"
              />
            </label>

            {estimate ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Masofa</div>
                  <div className="font-bold text-[#0F3460]">{estimate.distance_km} km</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <div className="text-xs text-slate-500">Taxminiy narx</div>
                  <div className="font-bold text-[#0F3460]">{formatSum(estimate.estimated_price)}</div>
                </div>
              </div>
            ) : null}
          </section>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={estimateBusy || requiredMissing()}
              onClick={() => void onEstimate()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-[#1A6BAC] disabled:opacity-50"
            >
              {estimateBusy ? <Loader variant="button" /> : null}
              Narxni ko‘rish
            </button>
            <button
              type="submit"
              disabled={busy || requiredMissing()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0F3460] py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              {busy ? <Loader variant="button" tone="onDark" /> : null}
              Buyurtma berish
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
