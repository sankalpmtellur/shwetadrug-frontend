import { AxiosError } from "axios";
import { api } from "../lib/api";
import type { ApiResponse } from "../types/auth";

export type InventoryStatus = "HEALTHY" | "LOW" | "REORDER" | "OUT_OF_STOCK" | "EXPIRED";

export type InventoryLot = {
  id: string;
  medicineId: string;
  medicine: {
    id: string;
    sku: string;
    name: string;
    sellingPrice: number;
    reorderLevel: number;
  };
  supplier: {
    id: string;
    name: string;
  } | null;
  batchNumber: string;
  expiryDate: string;
  quantityOnHand: number;
  quantityBlocked: number;
  availableQuantity: number;
  status: InventoryStatus;
};

export type InventoryUpdatePayload = {
  quantity?: number;
  sellingPrice?: number;
  expiryDate?: string;
};

export const inventoryService = {
  async getInventory() {
    const response = await api.get<ApiResponse<InventoryLot[]>>("/inventory", {
      params: { limit: 100 },
    });
    return response.data.data;
  },

  async getExpiringInventory(days = 60) {
    const response = await api.get<ApiResponse<InventoryLot[]>>("/inventory/alerts/expiring", {
      params: { days, limit: 100 },
    });
    return response.data.data;
  },

  async updateInventory(id: string, payload: InventoryUpdatePayload) {
    const response = await api.patch<ApiResponse<InventoryLot>>(`/inventory/${id}`, payload);
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
