import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { fetchDriverReviews } from "../../../services/admin.service";
import type { DriverReview, PaginationResponse } from "../lib/types";
import { formatDate, getAdminErrorMessage } from "../lib/utils";
import { AdminEmpty, AdminError, AdminLoading } from "../components/AdminState";
import { AdminPageShell } from "../components/AdminPageShell";

export default function AdminDriverReviewsPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const driverId = Number(id);
  const [data, setData] = useState<PaginationResponse<DriverReview> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!Number.isFinite(driverId)) {
      setError("Haydovchi topilmadi");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await fetchDriverReviews(driverId));
    } catch (e: unknown) {
      setError(getAdminErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(id);
  }, [load]);

  const avg = useMemo(() => {
    const items = data?.results ?? [];
    const nums = items.map((r) => Number(r.rating)).filter((n) => Number.isFinite(n));
    if (!nums.length) return "—";
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
  }, [data]);

  return (
    <AdminPageShell
      title="Haydovchi reytinglari"
      description={`O‘rtacha reyting: ${avg}`}
      action={<Button variant="outline" onClick={() => nav(-1)}>Orqaga</Button>}
    >
      {loading ? <AdminLoading /> : null}
      {error ? <AdminError message={error} onRetry={() => void load()} /> : null}
      {!loading && !error && (data?.results.length ?? 0) === 0 ? <AdminEmpty title="Reytinglar topilmadi" /> : null}
      <div className="space-y-3">
        {data?.results.map((review) => (
          <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="font-bold text-[#0F3460]">{review.client_name || "Mijoz"}</div>
              <div className="font-extrabold text-[#FD7E14]">★ {review.rating ?? "—"}</div>
            </div>
            <p className="mt-2 text-sm text-slate-600">{review.comment || review.text || "Izoh qoldirilmagan."}</p>
            <div className="mt-2 text-xs text-slate-400">{formatDate(review.created_at)}</div>
          </div>
        ))}
      </div>
    </AdminPageShell>
  );
}
