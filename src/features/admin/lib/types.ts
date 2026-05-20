export type AdminRole = "client" | "driver" | "admin";

export type PaginationResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ListResponse<T> = PaginationResponse<T> | T[];

export type AdminUser = {
  id: number;
  phone?: string;
  full_name?: string;
  name?: string;
  role?: AdminRole | string;
  is_active?: boolean;
  is_blocked?: boolean;
  created_at?: string;
};

export type AdminDriver = {
  id: number;
  phone?: string;
  full_name?: string;
  name?: string;
  car_model?: string;
  car_number?: string;
  car_color?: string;
  rating?: string | number | null;
  total_trips?: number;
  trips_count?: number;
  user?: AdminUser;
};

export type CreateDriverPayload = {
  phone: string;
  name: string;
  car_model: string;
  car_number: string;
  car_color: string;
};

export type AdminOrderStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export type AdminOrder = {
  id: number;
  status?: AdminOrderStatus | string;
  status_display?: string;
  client_name?: string;
  client_phone?: string;
  driver_name?: string;
  driver_phone?: string;
  estimated_price?: number | null;
  final_price?: number | null;
  distance_km?: string | number | null;
  created_at?: string;
  completed_at?: string | null;
  client?: AdminUser;
  driver?: AdminDriver | AdminUser | null;
  [key: string]: unknown;
};

export type DriverReview = {
  id: number;
  rating?: number | string;
  comment?: string;
  text?: string;
  client_name?: string;
  created_at?: string;
};
