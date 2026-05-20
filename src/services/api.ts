import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { store } from "../store/store";
import { clearAuth, setAccessToken, setTokens } from "../store/auth/authSlice";

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const API_BASE_URL =
  (import.meta.env.VITE_BASE_URL as string | undefined) ||
  "https://taxifast.uz/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

let refreshPromise: Promise<string> | null = null;

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, role } = store.getState().auth;
  if (!refreshToken || !role) {
    throw new Error("Refresh token mavjud emas.");
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<{
        access: string;
        refresh?: string;
        role?: "client" | "driver" | "admin";
      }>(`${API_BASE_URL}/users/auth/token/refresh/`, {
        refresh: refreshToken,
      })
      .then((res) => {
        const nextAccess = res.data.access;
        const nextRefresh = res.data.refresh ?? refreshToken;
        const nextRole = res.data.role ?? role;

        if (nextRefresh !== refreshToken || nextRole !== role) {
          store.dispatch(
            setTokens({
              access: nextAccess,
              refresh: nextRefresh,
              role: nextRole,
            }),
          );
        } else {
          store.dispatch(setAccessToken(nextAccess));
        }

        return nextAccess;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

// Request: access token qo‘shish
api.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response: 401 bo‘lsa logout + login pagega yo‘naltirish (keyin router bilan yaxshilaymiz)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const err = error as AxiosError;
    const status = err.response?.status;
    const original = err.config as RetryConfig | undefined;

    if (status === 401 && original && !original._retry) {
      const { accessToken } = store.getState().auth;
      const skipLogout =
        import.meta.env.DEV && accessToken === "dev-access-token";

      if (skipLogout) {
        return Promise.reject(error);
      }

      original._retry = true;

      try {
        const nextAccess = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${nextAccess}`;
        return api(original);
      } catch {
        store.dispatch(clearAuth());
        redirectToLogin();
      }
    }

    return Promise.reject(error);
  },
);
