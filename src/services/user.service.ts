import { api } from "./api";
import type { UserProfile } from "../types/user";

export async function fetchMe(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/users/me/");
  return data;
}

export async function patchMe(body: {
  full_name?: string;
}): Promise<UserProfile> {
  const { data } = await api.patch<UserProfile>("/users/me/", body);
  return data;
}
