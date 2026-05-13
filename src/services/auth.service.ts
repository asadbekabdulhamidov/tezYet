import { api } from "./api";

export type Role = "client" | "driver" | "admin";

export async function sendOtp(phone: string) {
  const { data } = await api.post("/users/auth/send-otp/", { phone });
  return data as { detail: string; is_registered: boolean };
}

export async function verifyOtp(phone: string, code: string) {
  const { data } = await api.post("/users/auth/verify-otp/", { phone, code });
  return data as { access: string; refresh: string; role: Role };
}

export async function registerOtp(
  phone: string,
  full_name: string,
  code: string,
) {
  const { data } = await api.post("/users/auth/register/", {
    phone,
    full_name,
    code,
  });
  return data as { access: string; refresh: string; role: Role };
}

export async function logoutApi(refresh: string) {
  await api.post("/users/auth/logout/", { refresh });
}
