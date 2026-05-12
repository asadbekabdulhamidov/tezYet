import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { registerOtp, verifyOtp } from "../../services/auth.service";
import { useAppDispatch } from "../../store/hooks";
import { setTokens } from "../../store/auth/authSlice";

type NavState = { phone: string; isRegistered: boolean };

export default function OtpPage() {
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const { state } = useLocation() as { state: NavState };

  const phone = state?.phone || "";
  const isRegistered = state?.isRegistered ?? true;

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const data = !isRegistered
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
      console.log("REGISTER ERROR:", error?.response?.data);
      setErr(error?.response?.data?.detail || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow">
        <h1 className="text-2xl font-semibold">OTP</h1>
        <p className="mt-1 text-sm text-slate-600">{phone}</p>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {!isRegistered && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ismingiz"
              className="w-full rounded-xl border px-3 py-2"
            />
          )}

          <input
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="6 xonali kod"
            className="w-full rounded-xl border px-3 py-2 tracking-widest"
            inputMode="numeric"
          />

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button
            disabled={
              loading || code.length !== 6 || (!isRegistered && !name.trim())
            }
            className="w-full rounded-xl bg-[#0F3460] py-2.5 text-white disabled:opacity-60"
          >
            {loading ? "Tekshirilmoqda..." : "Kirish"}
          </button>

          <button
            type="button"
            onClick={() => nav("/login")}
            className="w-full rounded-xl border py-2.5"
          >
            Orqaga
          </button>
        </form>
      </div>
    </div>
  );
}
