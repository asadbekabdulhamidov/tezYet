import { api } from "../../services/api";
import type { LocationPayload } from "./types";

export async function updateDriverLocation(
  body: LocationPayload,
): Promise<void> {
  await api.patch("/users/driver/location/", body);
}
