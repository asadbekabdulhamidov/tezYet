import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { ROUTES } from "./routes";

type Role = "client" | "driver" | "admin";

function homeForRole(role: Role): string {
  if (role === "admin") return ROUTES.adminRoot;
  if (role === "driver") return ROUTES.driverHome;
  return ROUTES.clientHome;
}

export function ProtectedRoute({ allowedRoles }: { allowedRoles: Role[] }) {
  const { isAuth, role } = useAppSelector((s) => s.auth);

  if (!isAuth) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={role ? homeForRole(role) : ROUTES.login} replace />;
  }

  return <Outlet />;
}
