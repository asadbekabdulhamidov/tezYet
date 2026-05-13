/** GET /api/orders/:id/ — to‘liq buyurtma (Swagger Order) */
export type OrderStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled"
  | string;

export type OrderDetail = {
  id: number;
  client_name: string;
  client_phone: string;
  driver_name?: string;
  driver_phone?: string;
  driver_car?: string;
  driver_car_color?: string;
  driver_rating?: string;
  from_address: string;
  to_address: string;
  from_lat: string;
  from_lon: string;
  to_lat: string;
  to_lon: string;
  distance_km: string | null;
  estimated_price: number;
  final_price: number | null;
  status: OrderStatus;
  status_display: string;
  comment: string;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
};
