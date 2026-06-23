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
};
