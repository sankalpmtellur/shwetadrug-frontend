import { api, apiRequest } from "../lib/api";

export type AdminDashboard = {
  totalRetailers?: number | null;
  totalMedicines?: number | null;
  inventoryCount?: number | null;
  totalOrders?: number | null;
  pendingOrders?: number | null;
  deliveredOrders?: number | null;
  totalRevenue?: number | null;
};

export const dashboardService = {
  getAdminDashboard() {
    return apiRequest<AdminDashboard>(api.get("/dashboard/admin"));
  },
};
