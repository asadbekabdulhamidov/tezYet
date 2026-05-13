type Variant = "page" | "section" | "inline" | "button";
type Tone = "default" | "onDark";

function SpinnerRing({
  size,
  tone,
  className = "",
}: {
  size: "lg" | "md" | "sm";
  tone: Tone;
  className?: string;
}) {
  const dim =
    size === "lg"
      ? "h-16 w-16 border-[3px]"
      : size === "md"
        ? "h-10 w-10 border-2"
        : "h-5 w-5 border-2";
  const border =
    tone === "onDark"
      ? "border-white/25 border-t-white border-r-white/70"
      : "border-[#0F3460]/15 border-t-[#1A6BAC] border-r-[#1A6BAC]/40";
  return (
    <span
      role="status"
      aria-hidden
      className={`inline-block animate-spin rounded-full ${dim} ${border} ${className}`}
    />
  );
}

export function Loader({
  variant = "page",
  tone = "default",
  label,
  className = "",
}: {
  variant?: Variant;
  tone?: Tone;
  label?: string;
  className?: string;
}) {
  const text =
    label ??
    (variant === "button"
      ? undefined
      : variant === "inline"
        ? "Yuklanmoqda…"
        : "Yuklanmoqda…");

  if (variant === "button") {
    return <SpinnerRing size="sm" tone={tone} className={className} />;
  }

  if (variant === "inline") {
    const inlineText = label ?? text;
    return (
      <span
        className={`inline-flex items-center gap-2 text-xs font-semibold text-[#1A6BAC] ${className}`}
      >
        <SpinnerRing size="sm" tone="default" />
        {inlineText ? <span>{inlineText}</span> : null}
      </span>
    );
  }

  if (variant === "section") {
    return (
      <div
        className={`flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-slate-100/80 bg-white/80 px-6 py-10 shadow-sm backdrop-blur-sm ${className}`}
      >
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-[#1A6BAC]/25 via-transparent to-[#0F3460]/20 blur-md" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F3460] to-[#1A6BAC] shadow-lg shadow-[#0F3460]/25">
            <span className="text-3xl drop-shadow-md" aria-hidden>
              🚕
            </span>
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <SpinnerRing
                size="lg"
                tone="onDark"
                className="!absolute !inset-0 !m-auto !h-[4.5rem] !w-[4.5rem] !border-[2.5px] !border-white/0 !border-t-white/90 !border-r-white/30 bg-transparent opacity-90"
              />
            </span>
          </div>
        </div>
        {text ? (
          <p className="text-center text-sm font-semibold tracking-wide text-[#0F3460]">
            {text}
          </p>
        ) : null}
        <div className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#1A6BAC]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#F8F9FA] bg-[radial-gradient(ellipse_at_top,_#1A6BAC12_0%,_transparent_55%)] px-6 ${className}`}
    >
      <div className="relative">
        <div className="absolute -inset-8 rounded-full bg-[#1A6BAC]/10 blur-2xl" />
        <div className="relative flex flex-col items-center gap-3">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0F3460] via-[#0F3460] to-[#1A6BAC] shadow-2xl shadow-[#0F3460]/30">
            <span className="text-4xl" aria-hidden>
              🚕
            </span>
            <SpinnerRing
              size="lg"
              tone="onDark"
              className="!absolute !inset-0 !m-auto !h-[5.5rem] !w-[5.5rem] !border-[3px] !border-white/0 !border-t-white !border-r-white/40"
            />
          </div>
          <p className="text-base font-bold tracking-tight text-[#0F3460]">
            TezYet Taxi
          </p>
        </div>
      </div>
      {text ? (
        <p className="text-sm font-medium text-slate-600">{text}</p>
      ) : null}
      <div className="flex gap-1.5 pt-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-[#1A6BAC]/80"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}
