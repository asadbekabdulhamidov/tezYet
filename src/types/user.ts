export type UserProfile = {
  id: number;
  phone: string;
  full_name: string;
  role: "client" | "driver" | "admin";
  created_at: string;
};
