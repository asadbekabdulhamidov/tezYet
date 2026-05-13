import type { DriverProfile } from "../types/driver";
import type { UserProfile } from "../types/user";

const KEY = "taxi-driver-profile-ui";

export type DriverProfileCache = {
  me: UserProfile;
  profile: DriverProfile;
  savedAt: string;
};

export function readDriverProfileCache(): DriverProfileCache | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DriverProfileCache;
  } catch {
    return null;
  }
}

export function writeDriverProfileCache(me: UserProfile, profile: DriverProfile) {
  const payload: DriverProfileCache = {
    me,
    profile,
    savedAt: new Date().toISOString(),
  };
  sessionStorage.setItem(KEY, JSON.stringify(payload));
}

export function clearDriverProfileCache() {
  sessionStorage.removeItem(KEY);
}
