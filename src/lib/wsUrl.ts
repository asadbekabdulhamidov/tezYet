/** Swagger: wss://taxifast.uz/ws/driver/ — haydovchi uchun yangi buyurtmalar */
export function getWsOrigin(): string {
  const raw = import.meta.env.VITE_WS_ORIGIN as string | undefined;
  if (raw) return raw.replace(/\/$/, "");

  const base = (import.meta.env.VITE_BASE_URL as string) || "";
  try {
    const u = new URL(base);
    return `${u.protocol === "https:" ? "wss:" : "ws:"}//${u.host}`;
  } catch {
    return "wss://taxifast.uz";
  }
}

/**
 * Backend odatda query orqali JWT yuboradi; boshqa sxema bo‘lsa VITE_WS_DRIVER_QUERY
 * (masalan: access_token=) bilan moslashtiring.
 */
export function buildDriverWsUrl(accessToken: string): string {
  const origin = getWsOrigin();
  const param = import.meta.env.VITE_WS_TOKEN_QUERY || "token";
  const q = new URLSearchParams({ [param]: accessToken }).toString();
  return `${origin}/ws/driver/?${q}`;
}

/** Swagger: wss://.../ws/orders/{order_id}/ */
export function buildOrderWsUrl(accessToken: string, orderId: number): string {
  const origin = getWsOrigin();
  const param = import.meta.env.VITE_WS_TOKEN_QUERY || "token";
  const q = new URLSearchParams({ [param]: accessToken }).toString();
  return `${origin}/ws/orders/${orderId}/?${q}`;
}
