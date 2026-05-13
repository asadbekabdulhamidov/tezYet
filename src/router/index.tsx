import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ROUTES } from "./routes";
import { RoleGuard } from "./RoleGuard";
import { DriverLayout } from "../layouts/DriverLayout";
import { Loader } from "../shared/ui/Loader";

// --- Lazy pages (default export bo‘lgani uchun shunday) ---
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const OtpPage = lazy(() => import("../pages/auth/OtpPage"));

const ClientHomePage = lazy(() => import("../pages/client/ClientHomePage"));
const HistoryPage = lazy(() => import("../pages/client/HistoryPage"));
const ProfilePage = lazy(() => import("../pages/client/ProfilePage"));
const OrderStatusPage = lazy(() => import("../pages/client/OrderStatusPage"));

const DriverHomePage = lazy(() => import("../pages/driver/DriverHomePage"));
const DriverHistoryPage = lazy(
  () => import("../pages/driver/DriverHistoryPage"),
);
const DriverProfilePage = lazy(
  () => import("../pages/driver/DriverProfilePage"),
);
const DriverOrderPage = lazy(() => import("../pages/driver/DriverOrderPage"));
const DriverMapPage = lazy(
  () => import("../features/driverMap/ui/DriverMapPage"),
);

const AdminHomePage = lazy(() => import("../pages/admin/AdminHomePage"));
const AdminDriversPage = lazy(() => import("../pages/admin/AdminDriversPage"));
const AdminUsersPage = lazy(() => import("../pages/admin/AdminUsersPage"));
const AdminOrdersPage = lazy(() => import("../pages/admin/AdminOrdersPage"));

const NotFoundPage = lazy(() => import("../pages/not-found/NotFoundPage"));

function PageLoader() {
  return <Loader variant="page" label="Sahifa yuklanmoqda…" />;
}

const withSuspense = (el: React.ReactNode) => (
  <Suspense fallback={<PageLoader />}>{el}</Suspense>
);

export const router = createBrowserRouter([
  // Public
  { path: ROUTES.login, element: withSuspense(<LoginPage />) },
  { path: ROUTES.otp, element: withSuspense(<OtpPage />) },

  // Clienta
  {
    element: <RoleGuard allow={["client"]} />,
    children: [
      { path: ROUTES.clientHome, element: withSuspense(<ClientHomePage />) },
      { path: ROUTES.clientHistory, element: withSuspense(<HistoryPage />) },
      { path: ROUTES.clientProfile, element: withSuspense(<ProfilePage />) },
      { path: ROUTES.clientOrder, element: withSuspense(<OrderStatusPage />) },
    ],
  },

  // Driver
  {
    element: <RoleGuard allow={["driver"]} />,
    children: [
      {
        path: "/driver",
        element: <DriverLayout />,
        children: [
          { index: true, element: withSuspense(<DriverHomePage />) },
          {
            path: "history",
            element: withSuspense(<DriverHistoryPage />),
          },
          { path: "map", element: withSuspense(<DriverMapPage />) },
          {
            path: "profile",
            element: withSuspense(<DriverProfilePage />),
          },
          { path: "order/:id", element: withSuspense(<DriverOrderPage />) },
        ],
      },
    ],
  },

  // Admin
  {
    element: <RoleGuard allow={["admin"]} />,
    children: [
      { path: ROUTES.adminRoot, element: withSuspense(<AdminHomePage />) },
      {
        path: ROUTES.adminDrivers,
        element: withSuspense(<AdminDriversPage />),
      },
      { path: ROUTES.adminUsers, element: withSuspense(<AdminUsersPage />) },
      { path: ROUTES.adminOrders, element: withSuspense(<AdminOrdersPage />) },
    ],
  },

  // 404
  { path: "*", element: withSuspense(<NotFoundPage />) },
]);
