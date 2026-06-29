import { api, apiRequest } from "../lib/api";

export type AdminDashboard = {
  totalRetailers?: number | null;
  activeRetailers?: number | null;
  pendingRetailerApprovals?: number | null;
  totalMedicines?: number | null;
  inventoryCount?: number | null;
  totalOrders?: number | null;
  ordersToday?: number | null;
  ordersThisMonth?: number | null;
  pendingOrders?: number | null;
  deliveredOrders?: number | null;
  totalRevenue?: number | null;
  revenueToday?: number | null;
  revenueThisMonth?: number | null;
  lowStockMedicinesCount?: number | null;
  medicinesExpiringNext60DaysCount?: number | null;
  monthlySales?: Array<{
    label: string;
    month: string;
    value: number;
  }>;
  topSellingMedicines?: Array<{
    medicineId: string;
    name: string;
    sku: string;
    quantity: number;
    value: number;
  }>;
  topRetailersByOrderValue?: Array<{
    retailerId: string;
    pharmacyName: string;
    ownerName: string;
    orderCount: number;
    value: number;
  }>;
};

export const dashboardService = {
  getAdminDashboard() {
    return apiRequest<AdminDashboard>(api.get("/dashboard/admin"));
  },
};
