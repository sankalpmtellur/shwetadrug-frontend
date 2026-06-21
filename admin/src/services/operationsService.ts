import { api, apiResult, readListMeta } from "../lib/api";
import type { ListMeta } from "../lib/api";

export type Medicine = {
  id: string;
  sku: string;
  name: string;
  genericName: string | null;
  packSize: string;
  category: { id: string; name: string } | null;
  manufacturer: { id: string; name: string } | null;
  mrp: number;
  sellingPrice: number;
  gstPercent: number;
  reorderLevel: number;
  status: string;
  availableStock: number;
};

export type Order = {
  id: string;
  orderNo: string;
  retailer: { id: string; pharmacyName: string; ownerName: string };
  status: string;
  priority: string;
  totalAmount: number;
  placedAt: string;
  deliveredAt: string | null;
  items: Array<{ id: string; medicineName: string; quantity: number }>;
};

export type Payment = {
  id: string;
  method: string;
  status: string;
  amount: number;
  transactionId: string | null;
  paidAt: string | null;
  order: {
    orderNo: string;
    retailer: { pharmacyName: string };
    status: string;
    placedAt: string;
  };
};

export type Claim = {
  id: string;
  claimNo: string;
  retailer: { pharmacyName: string };
  order: { orderNo: string; totalAmount: number } | null;
  reason: string;
  status: string;
  totalAmount: number;
  createdAt: string;
};

export type Delivery = {
  id: string;
  orderNo: string;
  retailer: { pharmacyName: string };
  status: string;
  placedAt: string;
  dispatchedAt: string | null;
  deliveredAt: string | null;
  totalAmount: number;
  items: Array<{ id: string; medicineName: string; quantity: number }>;
};

async function getList<T>(path: string): Promise<{ items: T[]; meta: ListMeta }> {
  const result = await apiResult<T[]>(api.get(path, { params: { limit: 100 } }));
  return {
    items: result.data,
    meta: readListMeta(result.meta),
  };
}

export const operationsService = {
  getMedicines() {
    return getList<Medicine>("/medicines");
  },
  deleteMedicine(id: string) {
    return apiResult<Medicine>(api.delete(`/medicines/${id}`));
  },
  getOrders() {
    return getList<Order>("/orders");
  },
  updateOrderStatus(id: string, status: string) {
    return apiResult<Order>(api.patch(`/orders/${id}/status`, { status }));
  },
  getPayments() {
    return getList<Payment>("/payments");
  },
  getClaims() {
    return getList<Claim>("/claims");
  },
  getDeliveries() {
    return getList<Delivery>("/deliveries");
  },
};
