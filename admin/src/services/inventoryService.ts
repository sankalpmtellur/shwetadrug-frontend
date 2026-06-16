import { api, apiResult, readListMeta } from "../lib/api";
import type { ListMeta } from "../lib/api";

export type InventoryItem = {
  id: string;
  medicineId: string;
  medicine: {
    id: string;
    sku: string;
    name: string;
    genericName: string | null;
    packSize: string | null;
    sellingPrice: number;
    mrp: number;
    gstPercent: number;
    reorderLevel: number;
    category: { id: string; name: string } | null;
    manufacturer: { id: string; name: string } | null;
  };
  supplier: { id: string; name: string; phone: string | null; email: string | null } | null;
  batchNumber: string;
  expiryDate: string;
  quantityOnHand: number;
  quantityBlocked: number;
  availableQuantity: number;
  costPrice: number | null;
  status: string;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
};

export const inventoryService = {
  async getInventory() {
    const result = await apiResult<InventoryItem[]>(api.get("/inventory", { params: { limit: 100 } }));
    return {
      items: result.data,
      meta: readListMeta(result.meta),
    };
  },

  async updateInventory(id: string, data: { quantity?: number; status?: string }) {
    const result = await apiResult<InventoryItem>(api.patch(`/inventory/${id}`, data));
    return result.data;
  },
};

export type { ListMeta };
