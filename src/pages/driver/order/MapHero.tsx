import type { OrderDetail } from "../../../types/orderDetail";
import { mapsDirUrl } from "./orderScreenUtils";

function MapArt({ order }: { order: OrderDetail }) {
  const has =
    order.from_lat &&
    order.from_lon &&
    order.to_lat &&
    order.to_lon &&
    !Number.isNaN(parseFloat(order.from_lat));
  return (
    <div className="relative h-full w-full overflow-hidden rounded-b-[1.25rem] bg-gradient-to-br from-slate-900 via-[#0F3460] to-[#1A6BAC]">
      <div className="absolute inset-0 opacity-30">
        <svg className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <pattern
              id="ogrid"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
                opacity="0.15"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ogrid)" />
        </svg>
      </div>
      {has ? (
        <svg
          className="absolute inset-4 h-[calc(100%-2rem)] w-[calc(100%-2rem)]"
          viewBox="0 0 320 200"
        >
          <path
            d="M 40 150 Q 120 40 280 50"
            fill="none"
            stroke="rgba(255,255,255,0.88)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <circle
            cx="40"
            cy="150"
            r="10"
            fill="#28A745"
            stroke="white"
            strokeWidth="3"
          />
          <circle
            cx="280"
            cy="50"
            r="10"
            fill="#DC3545"
            stroke="white"
            strokeWidth="3"
          />
          <circle
            cx="180"
            cy="95"
            r="8"
            fill="#1A6BAC"
            stroke="white"
            strokeWidth="2"
          />
        </svg>
      ) : (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center text-white/90">
          <p className="text-sm font-semibold">Xarita ma’lumoti yo‘q</p>
          <p className="mt-1 text-xs text-white/70">
            Google Maps ulangach bu yerda jonli marshrut ko‘rinadi.
          </p>
        </div>
      )}
    </div>
  );
}

export function MapHero({ order }: { order: OrderDetail }) {
  const open = () => window.open(mapsDirUrl(order), "_blank", "noopener,noreferrer");
  return (
    <div className="relative h-[38vh] min-h-[280px] w-full overflow-hidden rounded-b-3xl shadow-[0_12px_40px_rgba(15,52,96,0.18)]">
      <MapArt order={order} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={open}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg text-[#0F3460] shadow-lg active:scale-95"
          aria-label="Marshrut"
        >
          ⊕
        </button>
        <button
          type="button"
          onClick={open}
          className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#0F3460] shadow-lg active:scale-95"
          aria-label="Kattalashtirish"
        >
          +
        </button>
      </div>
    </div>
  );
}
