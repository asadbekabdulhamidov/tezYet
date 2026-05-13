import type { AuthState } from "./authSlice";

const KEY = "taxi-auth";

export function loadAuthFromStorage(): Partial<AuthState> | undefined {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return undefined;
    const a = JSON.parse(raw) as Partial<AuthState>;
    if (
      a?.accessToken &&
      a?.refreshToken &&
      a?.role &&
      ["client", "driver", "admin"].includes(a.role)
    ) {
      return {
        isAuth: true,
        accessToken: a.accessToken,
        refreshToken: a.refreshToken,
        role: a.role,
      };
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export function saveAuthToStorage(auth: AuthState) {
  if (!auth.isAuth || !auth.accessToken || !auth.refreshToken || !auth.role) {
    localStorage.removeItem(KEY);
    return;
  }
  localStorage.setItem(
    KEY,
    JSON.stringify({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      role: auth.role,
    }),
  );
}
