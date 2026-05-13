import { Button } from "./Button";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl text-slate-400">
        🕐
      </div>
      <h2 className="mt-4 text-lg font-bold text-[#0F3460]">{title}</h2>
      {description ? (
        <p className="mt-2 max-w-xs text-sm text-slate-600">{description}</p>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="mt-6 w-full max-w-xs" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
