import { Button } from "../../../shared/ui/Button";
import { Toggle } from "../../../shared/ui/Toggle";

export function AvailabilityCard({
  isAvailable,
  onAvailableChange,
  statusLine,
  lastSentLabel,
  sendError,
  onRefresh,
  disabled,
  busy,
}: {
  isAvailable: boolean;
  onAvailableChange: (v: boolean) => void;
  statusLine: string;
  lastSentLabel: string | null;
  sendError: string | null;
  onRefresh: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <div className="pointer-events-auto absolute inset-x-3 bottom-[calc(4.25rem+env(safe-area-inset-bottom)+12px)] z-30 max-w-lg rounded-2xl border border-slate-100/90 bg-white/95 p-4 shadow-[0_8px_32px_rgba(15,52,96,0.12)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">
            {isAvailable ? "Men tayyor" : "Men band"}
          </div>
          <p className="mt-0.5 text-xs text-[#1A6BAC]">{statusLine}</p>
          {sendError ? (
            <p className="mt-2 text-xs text-[#DC3545]">{sendError}</p>
          ) : null}
        </div>
        <Toggle
          checked={isAvailable}
          onChange={onAvailableChange}
          disabled={disabled}
          busy={busy}
          aria-label={isAvailable ? "Band qilish" : "Men tayyor"}
        />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5 truncate pr-2">
          <span aria-hidden>↻</span>
          <span className="truncate">{lastSentLabel ?? "Hali yuborilmagan"}</span>
        </span>
        <Button
          variant="ghost"
          className="!px-2 !py-1 shrink-0 font-bold"
          type="button"
          disabled={disabled || busy}
          onClick={() => void onRefresh()}
        >
          Yangilash
        </Button>
      </div>
    </div>
  );
}
