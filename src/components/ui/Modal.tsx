import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 px-3 pb-3 sm:items-center sm:p-6">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-base font-bold text-[#0F3460]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-500 hover:bg-slate-50"
            aria-label="Yopish"
          >
            x
          </button>
        </div>
        <div className="max-h-[70dvh] overflow-y-auto px-4 py-4">{children}</div>
        {footer ? (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
