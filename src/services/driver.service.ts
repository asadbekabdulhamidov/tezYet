import { api } from "./api";
import type { DriverProfile } from "../types/driver";
import {
  getDemoDriverProfile,
  isDemoDriverSession,
} from "../dev/driverDemoMocks";

export async function fetchDriverProfile(): Promise<DriverProfile> {
  if (isDemoDriverSession()) {
    return getDemoDriverProfile();
  }
  const { data } = await api.get<DriverProfile>("/users/driver/profile/");
  return data;
}

export async function patchDriverLocation(body: {
  lat?: string;
  lon?: string;
  is_available?: boolean;
}): Promise<void> {
  if (isDemoDriverSession()) {
    return;
  }
  await api.patch("/users/driver/location/", body);
}
