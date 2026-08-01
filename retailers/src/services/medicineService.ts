import { api } from "../lib/api";
import type { ApiResponse } from "../types/auth";
import type { Medicine } from "../types";

type BackendMedicine = {
  id: number;
  name: string;
  mrp: number;
  stock: number;
  batch: string;
  expiry_date: string;
  ptr?: number;
  packing?: string;
  max_discount_percent?: number;
};

type MedicineListMeta = {
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};

function formatExpiry(value: string | undefined) {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapMedicine(medicine: BackendMedicine): Medicine {
  const ptr = medicine.ptr ?? medicine.mrp;

  return {
    id: String(medicine.id),
    name: medicine.name,
    genericName: "Not available",
    manufacturer: "Shweta Drug Distributors",
    category: "Medicine",
    sku: medicine.batch,
    pack: medicine.packing ?? "Not available",
    price: ptr,
    mrp: medicine.mrp,
    stock: medicine.stock,
    batch: medicine.batch,
    expiry: formatExpiry(medicine.expiry_date),
    gst: 0,
    margin: medicine.max_discount_percent ?? 0,
    alternatives: [],
    status: medicine.stock <= 0 ? "Out" : medicine.stock <= 20 ? "Limited" : "In Stock",
  };
}

async function fetchAllMedicines(search = "") {
  const firstResponse = await api.get<ApiResponse<BackendMedicine[]> & { meta: MedicineListMeta }>("/medicines", {
    params: { page: 1, per_page: 100, search, sort: "asc" },
  });
  const firstPage = firstResponse.data.data;
  const totalPages = firstResponse.data.meta?.pagination?.total_pages ?? 1;

  if (totalPages <= 1) return firstPage.map(mapMedicine);

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      api.get<ApiResponse<BackendMedicine[]>>("/medicines", {
        params: { page: index + 2, per_page: 100, search, sort: "asc" },
      }),
    ),
  );

  return firstPage.concat(remaining.flatMap((response) => response.data.data)).map(mapMedicine);
}

export const medicineService = {
  async getMedicines() {
    return fetchAllMedicines();
  },

  async searchMedicines(query: string) {
    return fetchAllMedicines(query);
  },

  async getMedicine(id: string) {
    const response = await api.get<ApiResponse<BackendMedicine>>(`/medicines/${id}`);
    return mapMedicine(response.data.data);
  },
};
