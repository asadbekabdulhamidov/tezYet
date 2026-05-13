export const ROUTES = {
  login: "/login",
  otp: "/otp",

  clientHome: "/",
  clientHistory: "/history",
  clientProfile: "/profile",
  clientOrder: "/order/:id",

  driverHome: "/driver",
  driverHistory: "/driver/history",
  driverMap: "/driver/map",
  driverProfile: "/driver/profile",
  driverOrder: "/driver/order/:id",

  adminRoot: "/admin",
  adminDrivers: "/admin/drivers",
  adminUsers: "/admin/users",
  adminOrders: "/admin/orders",
} as const;
