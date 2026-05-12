import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOtp } from "../../services/auth.service";
import { formatPhone } from "../../shared/formatPhone";

export default function LoginPage() {
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const formatted = formatPhone(phone);
      const res = await sendOtp(formatted);

      nav("/otp", {
        state: { phone: formatted, isRegistered: res.is_registered },
      });
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 429) setErr("Juda tez urinayapsiz. Biroz kuting.");
      else if (status === 503) setErr("Xizmat vaqtincha mavjud emas.");
      else setErr(error?.response?.data?.detail || "Xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow">
        <h1 className="text-2xl font-semibold">Kirish</h1>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998901234567"
            className="w-full rounded-xl border px-3 py-2"
            inputMode="numeric"
          />

          {err && <div className="text-sm text-red-600">{err}</div>}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-[#0F3460] py-2.5 text-white disabled:opacity-60"
          >
            {loading ? "Yuborilmoqda..." : "Davom etish"}
          </button>
        </form>
      </div>
    </div>
  );
}
