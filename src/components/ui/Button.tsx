import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "danger" | "ghost";

const styles: Record<Variant, string> = {
  primary: "bg-[#0F3460] text-white shadow-sm hover:bg-[#0b294d]",
  secondary: "bg-[#1A6BAC] text-white shadow-sm hover:bg-[#14578d]",
  outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  danger: "bg-[#DC3545] text-white shadow-sm hover:bg-[#bd2d3a]",
  ghost: "bg-transparent text-[#1A6BAC] hover:bg-[#1A6BAC]/10",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
}) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
