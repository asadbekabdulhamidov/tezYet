type Props = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  busy?: boolean;
  "aria-label"?: string;
};

export function Toggle({
  checked,
  onChange,
  disabled = false,
  busy = false,
  "aria-label": ariaLabel = "Holatni almashtirish",
}: Props) {
  const off = disabled || busy;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-busy={busy}
      aria-label={ariaLabel}
      disabled={off}
      onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
        checked ? "bg-[#1A6BAC]" : "bg-slate-200"
      } ${off ? "opacity-60" : ""}`}
    >
      {busy ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden
          />
        </span>
      ) : (
        <span
          className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
            checked ? "left-7" : "left-1"
          }`}
        />
      )}
    </button>
  );
}
