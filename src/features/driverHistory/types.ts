export type Pagination<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type OrderHistoryItem = {
  id: number;
  from_address: string;
  to_address: string;
  estimated_price: number;
  final_price: number | null;
  distance_km?: string | null;
  status: string;
  status_display: string;
  created_at?: string;
  completed_at?: string | null;
  accepted_at?: string | null;
};

export type HistoryStatusFilter = "all" | "completed" | "cancelled";

export type HistoryTimeFilter = "all" | "today" | "week" | "month";
