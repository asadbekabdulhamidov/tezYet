import { api } from "./api";
import type { DriverAvailableOrder } from "../types/order";
import type { OrderDetail } from "../types/orderDetail";

export async function fetchDriverAvailable(): Promise<DriverAvailableOrder[]> {
  const { data } = await api.get<DriverAvailableOrder[]>(
    "/orders/driver/available/",
  );
  return Array.isArray(data) ? data : [];
}

export async function acceptOrder(orderId: number): Promise<void> {
  await api.post(`/orders/${orderId}/accept/`);
}

export async function fetchOrder(orderId: number): Promise<OrderDetail> {
  const { data } = await api.get<OrderDetail>(`/orders/${orderId}/`);
  return data;
}

export async function startOrder(orderId: number): Promise<void> {
  await api.post(`/orders/${orderId}/start/`);
}

export async function completeOrder(orderId: number): Promise<void> {
  await api.post(`/orders/${orderId}/complete/`);
}

export async function cancelOrder(orderId: number): Promise<void> {
  await api.post(`/orders/${orderId}/cancel/`);
}
