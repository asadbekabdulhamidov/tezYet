import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

type Role = "client" | "driver" | "admin";

export function RoleGuard({ allow }: { allow: Role[] }) {
  const { isAuth, role } = useAppSelector((s) => s.auth);

  if (!isAuth) return <Navigate to="/login" replace />;
  if (!role || !allow.includes(role)) return <Navigate to="/" replace />;

  return <Outlet />;
}
