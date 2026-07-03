import { api } from "../lib/api";
import type { ApiResponse } from "../types/auth";

export type EmployeeDashboard = {
  pendingOrders: number;
  packedShippedOrders: number;
  lowStockItems: number;
  expiringInventory: number;
  pendingClaims: number;
  activeDeliveries: number;
};

export const dashboardService = {
  async getEmployeeDashboard() {
    const response = await api.get<ApiResponse<EmployeeDashboard>>("/dashboard/employee");
    return response.data.data;
  },
};
