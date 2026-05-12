import axios from "axios";
import { store } from "../store/store";
import { clearAuth, setTokens } from "../store/auth/authSlice";

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
      // TZ: 401 bo‘lsa login'ga qaytarish va tokenlarni tozalash :contentReference[oaicite:2]{index=2} :contentReference[oaicite:3]{index=3}
      store.dispatch(clearAuth());
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);
