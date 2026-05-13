import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { registerOtp, sendOtp, verifyOtp } from "../../services/auth.service";
import { useAppDispatch } from "../../store/hooks";
import { setTokens } from "../../store/auth/authSlice";

type NavState = { phone: string; isRegistered: boolean };

export default function OtpPage() {
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const { state } = useLocation() as { state: NavState };

  const phone = state?.phone || "";
  const isRegistered = state?.isRegistered ?? true;
  const needName = useMemo(() => !isRegistered, [isRegistered]);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const [errTitle, setErrTitle] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // resend countdown (60s)
  const [sec, setSec] = useState(60);

  useEffect(() => {
    if (sec <= 0) return;
    const id = setInterval(() => setSec((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [sec]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setErrTitle(null);
    setLoading(true);

    try {
      const data = needName
        ? await registerOtp(phone, name.trim(), code)
        : await verifyOtp(phone, code);

      dispatch(
        setTokens({
          access: data.access,
          refresh: data.refresh,
          role: data.role,
        }),
      );

      if (data.role === "client") nav("/", { replace: true });
      if (data.role === "driver") nav("/driver", { replace: true });
      if (data.role === "admin") nav("/admin", { replace: true });
    } catch (error: any) {
      const status = error?.response?.status;
      setErrTitle(status ? `Xatolik ${status}` : "Xatolik");
      setErr(error?.response?.data?.detail || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (!phone || sec > 0) return;

    setErr(null);
    setErrTitle(null);
    setLoading(true);

    try {
      await sendOtp(phone);
      setSec(60);
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 429) {
        setErrTitle("Xatolik 429");
        setErr("Juda tez urinayapsiz. Iltimos, biroz kuting.");
      } else if (status === 503) {
        setErrTitle("Xatolik 503");
        setErr("Xizmat vaqtincha mavjud emas. Keyinroq urinib ko‘ring.");
      } else {
        setErrTitle("Xatolik");
        setErr(error?.response?.data?.detail || "Xatolik yuz berdi.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      {/* Top bar */}
      <div className="mx-auto w-full max-w-sm px-4 pt-4">
        <div className="flex items-center gap-2 text-[#0F3460]">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm">
            🚕
          </span>
          <div className="text-lg font-semibold">TezYet Taxi</div>
        </div>
      </div>

      <div className="mx-auto flex min-h-[calc(100dvh-64px)] w-full max-w-sm items-center px-4 pb-6">
        <div className="w-full rounded-2xl bg-white p-5 shadow-sm">
          {/* Error banner */}
          {err && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
              <div className="text-sm font-semibold">{errTitle}</div>
              <div className="mt-1 text-sm">{err}</div>
            </div>
          )}

          <h1 className="text-2xl font-semibold text-slate-900">OTP kod</h1>
          <p className="mt-1 text-sm text-slate-600">
            {phone ? (
              <>
                <span className="font-medium">{phone}</span> raqamiga yuborilgan
                6 xonali kodni kiriting
              </>
            ) : (
              "Telefon topilmadi. Orqaga qayting."
            )}
          </p>

          {import.meta.env.DEV && (
            <p className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 text-xs text-amber-950">
              <strong>Dev:</strong> SMS tejash uchun{" "}
              <button
                type="button"
                className="font-semibold text-amber-800 underline"
                onClick={() => nav("/login", { replace: true })}
              >
                Login
              </button>
              sahifasidagi «Client / Driver / Admin» tugmalaridan foydalaning.
            </p>
          )}

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            {needName && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  Ism
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    👤
                  </span>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="To‘liq ism"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-900 outline-none focus:border-[#1A6BAC] focus:ring-2 focus:ring-[#1A6BAC]/20"
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Kod</label>
              <input
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="______"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-center text-lg tracking-[0.6em] outline-none focus:border-[#1A6BAC] focus:ring-2 focus:ring-[#1A6BAC]/20"
                inputMode="numeric"
                autoFocus
              />
              <div className="text-xs text-slate-500">
                Kod kelmadimi?{" "}
                <button
                  type="button"
                  onClick={onResend}
                  disabled={loading || sec > 0}
                  className="font-medium text-[#1A6BAC] disabled:opacity-60"
                >
                  Qayta yuborish
                </button>{" "}
                {sec > 0 && <span className="text-slate-500">({sec}s)</span>}
              </div>
            </div>

            <button
              disabled={
                loading || code.length !== 6 || (needName && !name.trim())
              }
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3460] py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Tekshirilmoqda...
                </>
              ) : (
                "Kirish"
              )}
            </button>

            <button
              type="button"
              onClick={() => nav("/login")}
              className="w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-800"
            >
              Orqaga
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-slate-500">
            Xavfsizlik uchun kodni hech kimga bermang.
          </div>
        </div>
      </div>
    </div>
  );
}
