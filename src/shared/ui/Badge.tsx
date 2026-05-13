import type { ReactNode } from "react";

type Variant = "success" | "danger" | "secondary" | "warning";

const styles: Record<Variant, string> = {
  success:
    "bg-[#28A745]/12 text-[#28A745] ring-1 ring-[#28A745]/25 font-bold uppercase tracking-wide",
  danger:
    "bg-[#DC3545]/12 text-[#DC3545] ring-1 ring-[#DC3545]/25 font-bold uppercase tracking-wide",
  secondary:
    "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80 font-semibold uppercase tracking-wide",
  warning:
    "bg-[#FD7E14]/12 text-[#FD7E14] ring-1 ring-[#FD7E14]/25 font-bold uppercase tracking-wide",
};

export function Badge({
  children,
  variant = "secondary",
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
