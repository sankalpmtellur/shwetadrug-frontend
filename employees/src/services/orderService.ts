import { AxiosError } from "axios";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/auth";

export type BackendOrderStatus = "PENDING" | "VERIFIED" | "PICKING" | "PACKED" | "DISPATCHED" | "DELIVERED" | "CANCELLED" | "RETURNED";

export type EmployeeOrderItem = {
  id: string;
  medicineName: string;
  sku: string;
  batchNumber: string | null;
  packSize: string | null;
  quantity: number;
  lineTotal: number;
};

export type EmployeeOrder = {
  id: string;
  orderNo: string;
  retailer: {
    id: string;
    pharmacyName: string;
    ownerName: string;
    code: string;
  };
  deliveryAddress: {
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
  } | null;
  status: BackendOrderStatus;
  totalAmount: number;
  placedAt: string;
  items: EmployeeOrderItem[];
};

export const orderService = {
  async getOrders() {
    const response = await api.get<ApiResponse<EmployeeOrder[]>>("/orders", {
      params: { limit: 100 },
    });
    return response.data.data;
  },

  async getOrderById(id: string) {
    const response = await api.get<ApiResponse<EmployeeOrder>>(`/orders/${id}`);
    return response.data.data;
  },

  async updateStatus(id: string, status: BackendOrderStatus) {
    const response = await api.patch<ApiResponse<EmployeeOrder>>(`/orders/${id}/status`, { status });
    return response.data.data;
  },
};

export function getApiErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) return message;
  }

  return "Something went wrong. Please try again.";
}
