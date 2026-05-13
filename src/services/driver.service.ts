import { api } from "./api";
import type { DriverProfile } from "../types/driver";

export async function fetchDriverProfile(): Promise<DriverProfile> {
  const { data } = await api.get<DriverProfile>("/users/driver/profile/");
  return data;
}

export async function patchDriverLocation(body: {
  lat?: string;
  lon?: string;
  is_available?: boolean;
}): Promise<void> {
  await api.patch("/users/driver/location/", body);
}
