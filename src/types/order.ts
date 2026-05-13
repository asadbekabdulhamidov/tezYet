/** GET /api/orders/driver/available/ — backend ba’zan qo‘shimcha maydonlar yuborishi mumkin */
export type DriverAvailableOrder = {
  id: number;
  from_address: string;
  to_address: string;
  estimated_price: number;
  final_price: number | null;
  status: string;
  status_display: string;
  created_at: string;
  distance_km?: string | null;
  comment?: string | null;
  /** WS yoki to‘liq Order javobida bo‘lishi mumkin */
  from_lat?: string | null;
  from_lon?: string | null;
  to_lat?: string | null;
  to_lon?: string | null;
};
