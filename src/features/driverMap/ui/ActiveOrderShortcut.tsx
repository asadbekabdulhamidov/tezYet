import { Link } from "react-router-dom";
import { Badge } from "../../../shared/ui/Badge";
import { Button } from "../../../shared/ui/Button";
import type { ActiveOrderSnapshot } from "../types";

export function ActiveOrderShortcut({
  order,
}: {
  order: ActiveOrderSnapshot | null | undefined;
}) {
  if (!order) return null;

  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom)+13.5rem)] z-10 max-w-lg rounded-2xl border border-slate-100 bg-white p-4 shadow-lg sm:bottom-[calc(4.25rem+env(safe-area-inset-bottom)+14rem)]">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden>
            🚕
          </span>
          <div>
            <div className="text-sm font-bold text-[#0F3460]">Aktiv safar</div>
            <Badge variant="secondary" className="mt-0.5 !text-[9px]">
              {order.statusLabel ?? "YO‘LDA"}
            </Badge>
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-xs">
        <div>
          <div className="font-bold uppercase tracking-wide text-slate-400">
            Jo&apos;nash manzili
          </div>
          <div className="mt-0.5 font-medium text-slate-800">
            {order.from_address}
          </div>
        </div>
        <div>
          <div className="font-bold uppercase tracking-wide text-slate-400">
            Borish manzili
          </div>
          <div className="mt-0.5 font-medium text-slate-800">
            {order.to_address}
          </div>
        </div>
      </div>
      <Link to={`/driver/order/${order.id}`} className="mt-3 block">
        <Button variant="primary" className="w-full gap-2 !py-3.5 text-base">
          Safarga o&apos;tish <span aria-hidden>➜</span>
        </Button>
      </Link>
    </div>
  );
}
