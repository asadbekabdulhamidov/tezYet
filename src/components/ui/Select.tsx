import type { SelectHTMLAttributes } from "react";

export function Select({
  label,
  children,
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
}) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-xs font-semibold text-slate-600">
          {label}
        </span>
      ) : null}
      <select
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#1A6BAC] focus:ring-2 focus:ring-[#1A6BAC]/15 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
