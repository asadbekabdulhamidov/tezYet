import type { GeoCoords } from "../types";

export function MapPlaceholder({
  variant,
  zoom,
  coords,
  showDebugCoords,
}: {
  variant: "dark" | "light";
  zoom: number;
  coords: GeoCoords | null;
  showDebugCoords?: boolean;
}) {
  const dark = variant === "dark";
  return (
    <div
      className={`relative h-full min-h-full w-full overflow-hidden ${
        dark
          ? "bg-gradient-to-b from-[#0a1628] via-[#0f2744] to-[#0a1628]"
          : "bg-gradient-to-b from-slate-100 via-slate-200/90 to-slate-100"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: dark
            ? "linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px)"
            : "linear-gradient(90deg, rgba(15,52,96,.06) 1px, transparent 1px), linear-gradient(rgba(15,52,96,.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <span
            className={`absolute -inset-6 animate-ping rounded-full opacity-40 ${
              dark ? "bg-[#1A6BAC]" : "bg-[#1A6BAC]/50"
            }`}
          />
          <div
            className={`relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg ${
              dark
                ? "bg-[#0F3460] ring-4 ring-[#1A6BAC]/40"
                : "bg-white ring-4 ring-[#1A6BAC]/25"
            }`}
          >
            <span className="text-2xl" aria-hidden>
              🚕
            </span>
          </div>
        </div>
      </div>
      {showDebugCoords && coords ? (
        <p
          className={`absolute bottom-3 left-3 max-w-[90%] truncate font-mono text-[10px] ${
            dark ? "text-white/40" : "text-slate-500"
          }`}
        >
          {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
        </p>
      ) : null}
    </div>
  );
}
