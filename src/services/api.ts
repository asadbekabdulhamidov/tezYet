import axios from "axios";
import { store } from "../store/store";
import { clearAuth } from "../store/auth/authSlice";

export const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

console.log(import.meta.env.VITE_BASE_URL);

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
    const status = error?.response?.status;

    if (status === 401) {
      const { accessToken } = store.getState().auth;
      const skipLogout =
        import.meta.env.DEV && accessToken === "dev-access-token";

      if (!skipLogout) {
        store.dispatch(clearAuth());
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
