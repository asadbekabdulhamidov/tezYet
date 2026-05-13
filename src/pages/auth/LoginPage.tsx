import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp } from "../../services/auth.service";
import { formatPhone } from "../../shared/formatPhone";
import { Loader } from "../../shared/ui/Loader";
import { useAppDispatch } from "../../store/hooks";
import { setTokens, clearAuth } from "../../store/auth/authSlice";

const DEV_MOCK_TOKENS = {
  access: "dev-access-token",
  refresh: "dev-refresh-token",
} as const;

export default function LoginPage() {
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [errTitle, setErrTitle] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setErrTitle(null);
    setLoading(true);

    try {
      const formatted = formatPhone(phone);
      const res = await sendOtp(formatted);
      nav("/otp", {
        state: { phone: formatted, isRegistered: res.is_registered },
      });
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

  function devLoginAs(role: "client" | "driver" | "admin") {
    dispatch(
      setTokens({
        ...DEV_MOCK_TOKENS,
        role,
      }),
    );
    if (role === "client") nav("/", { replace: true });
    if (role === "driver") nav("/driver", { replace: true });
    if (role === "admin") nav("/admin", { replace: true });
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

          {import.meta.env.DEV && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950">
              <div className="text-xs font-semibold uppercase tracking-wide">
                Dev — SMSsiz
              </div>
              <p className="mt-1 text-xs text-amber-900/90">
                OTP yuborilmasin: rolni tanlang. Tokenlar mock; API chaqiruvlari
                401 bersa, baribir UI ko‘rasiz.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => devLoginAs("client")}
                  className="rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-medium text-white"
                >
                  Client
                </button>
                <button
                  type="button"
                  onClick={() => devLoginAs("driver")}
                  className="rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-medium text-white"
                >
                  Driver
                </button>
                <button
                  type="button"
                  onClick={() => devLoginAs("admin")}
                  className="rounded-lg bg-amber-600 px-2.5 py-1.5 text-xs font-medium text-white"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(clearAuth());
                    nav("/login", { replace: true });
                  }}
                  className="rounded-lg border border-amber-700/40 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-950"
                >
                  Chiqish
                </button>
              </div>
            </div>
          )}

          <h1 className="text-2xl font-semibold text-slate-900">
            Xush kelibsiz
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Tizimga kirish uchun telefon raqamingizni kiriting
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Telefon raqam
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  📞
                </span>

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 yoki +7 bilan"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-slate-900 outline-none focus:border-[#1A6BAC] focus:ring-2 focus:ring-[#1A6BAC]/20"
                  inputMode="numeric"
                />
              </div>

              <div className="text-xs text-slate-500">
                Masalan: +998901234567
              </div>
            </div>

            <button
              disabled={loading}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F3460] py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader variant="button" tone="onDark" />
                  Yuklanmoqda...
                </>
              ) : (
                <>
                  Davom etish <span aria-hidden>→</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center text-xs text-slate-500">
            Davom etish orqali siz{" "}
            <span className="text-[#1A6BAC] underline">shartlarga</span> rozilik
            bildirasiz.
          </div>
        </div>
      </div>
    </div>
  );
}
