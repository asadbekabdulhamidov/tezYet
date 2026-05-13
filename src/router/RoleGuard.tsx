import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { ROUTES } from "./routes";

type Role = "client" | "driver" | "admin";

function homeForRole(role: Role): string {
  if (role === "driver") return ROUTES.driverHome;
  if (role === "admin") return ROUTES.adminRoot;
  return ROUTES.clientHome;
}

export function RoleGuard({ allow }: { allow: Role[] }) {
  const { isAuth, role } = useAppSelector((s) => s.auth);

  if (!isAuth) return <Navigate to="/login" replace />;
  if (!role || !allow.includes(role)) {
    return <Navigate to={role ? homeForRole(role) : ROUTES.login} replace />;
  }

  return <Outlet />;
}
