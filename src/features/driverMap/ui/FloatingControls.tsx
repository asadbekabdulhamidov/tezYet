export function FloatingControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onLocate,
  disabled,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: () => void;
  disabled?: boolean;
}) {
  const btn =
    "flex h-11 w-11 items-center justify-center rounded-xl border border-white/80 bg-white/95 text-lg text-[#0F3460] shadow-md backdrop-blur-sm active:scale-95 disabled:opacity-40";
  return (
    <div className="pointer-events-auto absolute bottom-[calc(12.5rem+env(safe-area-inset-bottom))] right-3 z-30 flex flex-col gap-2 sm:bottom-[calc(13rem+env(safe-area-inset-bottom))]">
      <button
        type="button"
        className={btn}
        aria-label="Mening joylashuvim"
        disabled={disabled}
        onClick={onLocate}
      >
        ⊙
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Kattalashtirish"
        disabled={disabled || zoom >= 18}
        onClick={onZoomIn}
      >
        +
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Kichiklashtirish"
        disabled={disabled || zoom <= 10}
        onClick={onZoomOut}
      >
        −
      </button>
    </div>
  );
}
