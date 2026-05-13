import { api } from "./api";
import type { UserProfile } from "../types/user";
import {
  applyDemoUserPatch,
  getDemoUser,
  isDemoDriverSession,
} from "../dev/driverDemoMocks";

export async function fetchMe(): Promise<UserProfile> {
  if (isDemoDriverSession()) {
    return getDemoUser();
  }
  const { data } = await api.get<UserProfile>("/users/me/");
  return data;
}

export async function patchMe(body: {
  full_name?: string;
}): Promise<UserProfile> {
  if (isDemoDriverSession()) {
    applyDemoUserPatch(body);
    return getDemoUser();
  }
  const { data } = await api.patch<UserProfile>("/users/me/", body);
  return data;
}
