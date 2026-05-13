import type { OrderDetail, OrderStatus } from "../../../types/orderDetail";

export const ORDER_STEPS = [
  "Buyurtma qabul qilindi",
  "Mijoz kutilyapti",
  "Safar boshlandi",
  "Yakunlandi",
] as const;

export function stepModes(
  status: OrderStatus,
): ("done" | "current" | "upcoming")[] {
  if (status === "pending") {
    return ["current", "upcoming", "upcoming", "upcoming"];
  }
  if (status === "accepted") {
    return ["done", "current", "upcoming", "upcoming"];
  }
  if (status === "in_progress") {
    return ["done", "done", "current", "upcoming"];
  }
  if (status === "completed") {
    return ["done", "done", "done", "done"];
  }
  if (status === "cancelled") {
    return ["done", "upcoming", "upcoming", "upcoming"];
  }
  return ["upcoming", "upcoming", "upcoming", "upcoming"];
}

export function rideHeadline(status: OrderStatus): string {
  if (status === "accepted") return "Mijoz kutmoqda";
  if (status === "in_progress") return "Safar boshlandi";
  if (status === "pending") return "Buyurtma kutilmoqda";
  return "Safar";
}

export function parseKm(raw: string | null): number {
  const n = parseFloat(String(raw ?? ""));
  return Number.isFinite(n) ? n : 0;
}

export function etaMinutesLabel(km: number): string {
  if (km <= 0) return "—";
  return String(Math.max(3, Math.round(km * 2.1)));
}

export function mapsDirUrl(o: OrderDetail): string {
  if (o.from_lat && o.from_lon && o.to_lat && o.to_lon) {
    return `https://www.google.com/maps/dir/${o.from_lat},${o.from_lon}/${o.to_lat},${o.to_lon}`;
  }
  const q = encodeURIComponent(`${o.from_address} → ${o.to_address}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function tripDurationLabel(o: OrderDetail): string {
  if (!o.accepted_at || !o.completed_at) return "—";
  const a = new Date(o.accepted_at).getTime();
  const b = new Date(o.completed_at).getTime();
  if (!Number.isFinite(a) || !Number.isFinite(b)) return "—";
  return String(Math.max(1, Math.round((b - a) / 60_000)));
}

export function headerBadge(status: OrderStatus): {
  text: string;
  className: string;
} {
  if (status === "in_progress") {
    return {
      text: "YO'LDA",
      className: "bg-[#6F42C1]/15 text-[#6F42C1] ring-1 ring-[#6F42C1]/25",
    };
  }
  if (status === "accepted") {
    return {
      text: "QABUL QILINDI",
      className: "bg-[#1A6BAC]/12 text-[#1A6BAC] ring-1 ring-[#1A6BAC]/20",
    };
  }
  if (status === "pending") {
    return {
      text: "KUTILMOQDA",
      className: "bg-[#FD7E14]/12 text-[#FD7E14] ring-1 ring-[#FD7E14]/25",
    };
  }
  return {
    text: String(status).toUpperCase(),
    className: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80",
  };
}
