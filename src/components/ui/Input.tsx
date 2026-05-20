import type { InputHTMLAttributes } from "react";

export function Input({
  label,
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string | null;
}) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1 block text-xs font-semibold text-slate-600">
          {label}
        </span>
      ) : null}
      <input
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1A6BAC] focus:ring-2 focus:ring-[#1A6BAC]/15 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-[#DC3545]">{error}</span> : null}
    </label>
  );
}
