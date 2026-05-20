import type { ReactNode } from "react";

type Tone = "info" | "success" | "warning" | "danger";

const styles: Record<Tone, string> = {
  info: "border-[#1A6BAC]/20 bg-[#1A6BAC]/10 text-[#0F3460]",
  success: "border-[#28A745]/20 bg-[#28A745]/10 text-[#16652a]",
  warning: "border-[#FD7E14]/25 bg-[#FD7E14]/10 text-[#8a4300]",
  danger: "border-[#DC3545]/20 bg-[#DC3545]/10 text-[#9b2430]",
};

export function Alert({
  children,
  tone = "info",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${styles[tone]} ${className}`}>
      {children}
    </div>
  );
}

export function OfflineBanner() {
  return (
    <div className="bg-[#FD7E14] px-4 py-2 text-center text-sm font-semibold text-white">
      Internet yo‘q
    </div>
  );
}
