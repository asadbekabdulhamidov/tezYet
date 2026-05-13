import type { UserProfile } from "./user";

export type DriverProfile = {
  id: number;
  user: UserProfile;
  car_model: string;
  car_number: string;
  car_color: string;
  is_available: boolean;
  current_lat: string | null;
  current_lon: string | null;
  rating: string;
  total_trips: number;
  created_at: string;
};
