export function Spinner({
  label = "Yuklanmoqda...",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-2 text-sm text-slate-500 ${className}`}>
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#1A6BAC]" />
      <span>{label}</span>
    </div>
  );
}
