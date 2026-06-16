import { api } from "../lib/api";
import type { ApiResponse } from "../types/auth";
import type { Medicine } from "../types";

type BackendMedicine = {
  id: string;
  sku: string;
  name: string;
  genericName: string | null;
  packSize: string;
  category: { name: string } | null;
  manufacturer: { name: string } | null;
  mrp: number;
  sellingPrice: number;
  gstPercent: number;
  marginPercent: number | null;
  reorderLevel: number;
  status: "ACTIVE" | "DISCONTINUED" | "BLOCKED";
  availableStock: number;
  batches: Array<{
    batchNumber: string;
    expiryDate: string;
    quantityOnHand: number;
    quantityBlocked: number;
  }>;
};

function formatExpiry(value: string | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

function toMedicineStatus(medicine: BackendMedicine): Medicine["status"] {
  if (medicine.status !== "ACTIVE" || medicine.availableStock <= 0) return "Out";
  if (medicine.availableStock <= Math.max(medicine.reorderLevel, 100)) return "Limited";
  return "In Stock";
}

function mapMedicine(medicine: BackendMedicine): Medicine {
  const firstBatch = medicine.batches[0];

  return {
    id: medicine.id,
    name: medicine.name,
    genericName: medicine.genericName ?? "Not available",
    manufacturer: medicine.manufacturer?.name ?? "Not available",
    category: medicine.category?.name ?? "Uncategorized",
    sku: medicine.sku,
    pack: medicine.packSize,
    price: medicine.sellingPrice,
    mrp: medicine.mrp,
    stock: medicine.availableStock,
    batch: firstBatch?.batchNumber ?? "Not available",
    expiry: formatExpiry(firstBatch?.expiryDate),
    gst: medicine.gstPercent,
    margin: medicine.marginPercent ?? 0,
    alternatives: [],
    status: toMedicineStatus(medicine),
  };
}

export const medicineService = {
  async getMedicines() {
    const response = await api.get<ApiResponse<BackendMedicine[]>>("/medicines", {
      params: { limit: 100, status: "ACTIVE" },
    });
    return response.data.data.map(mapMedicine);
  },

  async searchMedicines(query: string) {
    const response = await api.get<ApiResponse<BackendMedicine[]>>("/medicines/search", {
      params: { q: query, limit: 100, status: "ACTIVE" },
    });
    return response.data.data.map(mapMedicine);
  },
};
