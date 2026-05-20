import { api } from "./api";
import type { DriverAvailableOrder } from "../types/order";
import type { OrderDetail } from "../types/orderDetail";

export type CreateOrderPayload = {
  from_address: string;
  from_lat: string;
  from_lon: string;
  to_address: string;
  to_lat: string;
  to_lon: string;
  comment?: string;
};

export type EstimatePayload = Pick<
  CreateOrderPayload,
  "from_lat" | "from_lon" | "to_lat" | "to_lon"
>;

export type EstimateResult = {
  distance_km: string | number;
  estimated_price: number;
};

export async function createClientOrder(
  payload: CreateOrderPayload,
): Promise<OrderDetail> {
  const { data } = await api.post<OrderDetail>("/orders/", payload);
  return data;
}

export async function estimateClientOrder(
  payload: EstimatePayload,
): Promise<EstimateResult> {
  const { data } = await api.post<EstimateResult>("/orders/estimate/", payload);
  return data;
}

export async function fetchClientOrders(): Promise<DriverAvailableOrder[]> {
  const { data } = await api.get<DriverAvailableOrder[]>("/orders/");
  return Array.isArray(data) ? data : [];
}

export async function fetchClientOrder(orderId: number): Promise<OrderDetail> {
  const { data } = await api.get<OrderDetail>(`/orders/${orderId}/`);
  return data;
}

export async function cancelClientOrder(orderId: number): Promise<void> {
  await api.post(`/orders/${orderId}/cancel/`);
}
