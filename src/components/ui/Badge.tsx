import type { ReactNode } from "react";

type BadgeTone =
  | "default"
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "success"
  | "danger"
  | "warning";

const toneClasses: Record<BadgeTone, string> = {
  default: "bg-slate-100 text-slate-600 ring-slate-200",
  pending: "bg-[#FD7E14]/12 text-[#FD7E14] ring-[#FD7E14]/25",
  accepted: "bg-[#1A6BAC]/12 text-[#1A6BAC] ring-[#1A6BAC]/25",
  in_progress: "bg-[#6F42C1]/12 text-[#6F42C1] ring-[#6F42C1]/25",
  completed: "bg-[#28A745]/12 text-[#28A745] ring-[#28A745]/25",
  cancelled: "bg-[#DC3545]/12 text-[#DC3545] ring-[#DC3545]/25",
  success: "bg-[#28A745]/12 text-[#28A745] ring-[#28A745]/25",
  danger: "bg-[#DC3545]/12 text-[#DC3545] ring-[#DC3545]/25",
  warning: "bg-[#FD7E14]/12 text-[#FD7E14] ring-[#FD7E14]/25",
};

export function Badge({
  children,
  tone = "default",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
