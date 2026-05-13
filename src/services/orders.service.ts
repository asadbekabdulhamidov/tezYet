import { api } from "./api";
import type { DriverAvailableOrder } from "../types/order";
import type { OrderDetail } from "../types/orderDetail";
import {
  demoAcceptOrder,
  demoCancelOrder,
  demoCompleteOrder,
  demoStartOrder,
  getDemoAvailableOrders,
  getDemoOrderDetail,
  isDemoDriverSession,
} from "../dev/driverDemoMocks";

function rejectNotFound(): Promise<never> {
  return Promise.reject({
    response: {
      status: 404,
      data: { detail: "Buyurtma topilmadi." },
    },
  });
}

export async function fetchDriverAvailable(): Promise<DriverAvailableOrder[]> {
  if (isDemoDriverSession()) {
    return getDemoAvailableOrders();
  }
  const { data } = await api.get<DriverAvailableOrder[]>(
    "/orders/driver/available/",
  );
  return Array.isArray(data) ? data : [];
}

export async function acceptOrder(orderId: number): Promise<void> {
  if (isDemoDriverSession()) {
    demoAcceptOrder(orderId);
    return;
  }
  await api.post(`/orders/${orderId}/accept/`);
}

export async function fetchOrder(orderId: number): Promise<OrderDetail> {
  if (isDemoDriverSession()) {
    const o = getDemoOrderDetail(orderId);
    if (o) return o;
    return rejectNotFound();
  }
  const { data } = await api.get<OrderDetail>(`/orders/${orderId}/`);
  return data;
}

export async function startOrder(orderId: number): Promise<void> {
  if (isDemoDriverSession()) {
    demoStartOrder(orderId);
    return;
  }
  await api.post(`/orders/${orderId}/start/`);
}

export async function completeOrder(orderId: number): Promise<void> {
  if (isDemoDriverSession()) {
    demoCompleteOrder(orderId);
    return;
  }
  await api.post(`/orders/${orderId}/complete/`);
}

export async function cancelOrder(orderId: number): Promise<void> {
  if (isDemoDriverSession()) {
    demoCancelOrder(orderId);
    return;
  }
  await api.post(`/orders/${orderId}/cancel/`);
}
