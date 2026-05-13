import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost";

const base =
  "inline-flex items-center justify-center rounded-xl font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-[#0F3460] text-white shadow-md px-4 py-2.5 text-sm",
  outline:
    "border border-slate-200 bg-white text-slate-700 px-4 py-2.5 text-sm hover:bg-slate-50",
  ghost: "text-[#1A6BAC] px-2 py-1 text-sm hover:underline",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
