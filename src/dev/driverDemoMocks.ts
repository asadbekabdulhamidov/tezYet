import { store } from "../store/store";
import type { DriverAvailableOrder } from "../types/order";
import type { OrderDetail, OrderStatus } from "../types/orderDetail";
import type { DriverProfile } from "../types/driver";
import type { UserProfile } from "../types/user";

/** Login sahifasidagi “dev” haydovchi tokeni bilan ishlaydi; backendsiz sinov. */
export function isDemoDriverSession(): boolean {
  return store.getState().auth.accessToken === "dev-access-token";
}

const DEMO_USER: UserProfile = {
  id: 88001,
  phone: "+998901112233",
  full_name: "Demo Haydovchi",
  role: "driver",
  created_at: new Date().toISOString(),
};

let demoUserPatch: Partial<UserProfile> = {};

export function applyDemoUserPatch(p: Partial<UserProfile>): void {
  demoUserPatch = { ...demoUserPatch, ...p };
}

const DEMO_DRIVER: DriverProfile = {
  id: 77001,
  user: DEMO_USER,
  car_model: "Chevrolet Cobalt",
  car_number: "01 A 777 AA",
  car_color: "Oq",
  is_available: true,
  current_lat: "41.2995",
  current_lon: "69.2401",
  rating: "4.9",
  total_trips: 42,
  created_at: new Date().toISOString(),
};

export const DEMO_AVAILABLE_ORDER: DriverAvailableOrder = {
  id: 9001,
  from_address: "Amir Temur shoh ko‘chasi, 15",
  to_address: "Chilonzor 10, Qatortol ko‘chasi, 24",
  estimated_price: 45_000,
  final_price: null,
  status: "pending",
  status_display: "Yangi",
  created_at: new Date().toISOString(),
  distance_km: "8.2",
  comment: "Demo buyurtma (frontend mock, backend shart emas)",
  from_lat: "41.311081",
  from_lon: "69.279737",
  to_lat: "41.286505",
  to_lon: "69.203518",
};

type DemoPhase =
  | "on_list"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

let demoPhase: DemoPhase = "on_list";

export function resetDriverDemoFlow(): void {
  demoPhase = "on_list";
  demoUserPatch = {};
}

function baseOrderDetail(status: OrderStatus, status_display: string): OrderDetail {
  const u = getDemoUser();
  return {
    id: DEMO_AVAILABLE_ORDER.id,
    client_name: "Demo Mijoz",
    client_phone: "+998 90 000 00 00",
    driver_name: u.full_name,
    driver_phone: u.phone,
    driver_car: DEMO_DRIVER.car_model,
    driver_car_color: DEMO_DRIVER.car_color,
    driver_rating: DEMO_DRIVER.rating,
    from_address: DEMO_AVAILABLE_ORDER.from_address,
    to_address: DEMO_AVAILABLE_ORDER.to_address,
    from_lat: DEMO_AVAILABLE_ORDER.from_lat ?? "0",
    from_lon: DEMO_AVAILABLE_ORDER.from_lon ?? "0",
    to_lat: DEMO_AVAILABLE_ORDER.to_lat ?? "0",
    to_lon: DEMO_AVAILABLE_ORDER.to_lon ?? "0",
    distance_km: DEMO_AVAILABLE_ORDER.distance_km ?? null,
    estimated_price: DEMO_AVAILABLE_ORDER.estimated_price,
    final_price: null,
    status,
    status_display,
    comment: DEMO_AVAILABLE_ORDER.comment ?? "",
    created_at: DEMO_AVAILABLE_ORDER.created_at,
    accepted_at: status === "pending" ? null : new Date().toISOString(),
    completed_at: status === "completed" ? new Date().toISOString() : null,
  };
}

export function getDemoUser(): UserProfile {
  return { ...DEMO_USER, ...demoUserPatch };
}

export function getDemoDriverProfile(): DriverProfile {
  return {
    ...DEMO_DRIVER,
    user: { ...getDemoUser() },
  };
}

export function getDemoAvailableOrders(): DriverAvailableOrder[] {
  if (demoPhase === "on_list") return [{ ...DEMO_AVAILABLE_ORDER }];
  return [];
}

export function getDemoOrderDetail(orderId: number): OrderDetail | null {
  if (orderId !== DEMO_AVAILABLE_ORDER.id) return null;
  switch (demoPhase) {
    case "on_list":
      return baseOrderDetail("pending", "Kutilmoqda");
    case "accepted":
      return baseOrderDetail("accepted", "Qabul qilindi");
    case "in_progress":
      return baseOrderDetail("in_progress", "Yo‘lda");
    case "completed":
      return baseOrderDetail("completed", "Yakunlandi");
    case "cancelled":
      return baseOrderDetail("cancelled", "Bekor qilindi");
    default:
      return baseOrderDetail("pending", "Kutilmoqda");
  }
}

export function demoAcceptOrder(orderId: number): void {
  if (orderId === DEMO_AVAILABLE_ORDER.id && demoPhase === "on_list") {
    demoPhase = "accepted";
  }
}

export function demoStartOrder(orderId: number): void {
  if (orderId === DEMO_AVAILABLE_ORDER.id && demoPhase === "accepted") {
    demoPhase = "in_progress";
  }
}

export function demoCompleteOrder(orderId: number): void {
  if (orderId === DEMO_AVAILABLE_ORDER.id && demoPhase === "in_progress") {
    demoPhase = "completed";
  }
}

export function demoCancelOrder(orderId: number): void {
  if (orderId !== DEMO_AVAILABLE_ORDER.id) return;
  if (
    demoPhase === "on_list" ||
    demoPhase === "accepted" ||
    demoPhase === "in_progress"
  ) {
    demoPhase = "cancelled";
  }
}

export function getActiveDemoOrderSnapshot(): import("../features/driverMap/types").ActiveOrderSnapshot | null {
  if (!isDemoDriverSession()) return null;
  if (demoPhase === "accepted" || demoPhase === "in_progress") {
    return {
      id: DEMO_AVAILABLE_ORDER.id,
      from_address: DEMO_AVAILABLE_ORDER.from_address,
      to_address: DEMO_AVAILABLE_ORDER.to_address,
      statusLabel: demoPhase === "in_progress" ? "YO‘LDA" : "QABUL",
    };
  }
  return null;
}
