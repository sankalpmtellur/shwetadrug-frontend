import { api } from "../lib/api";
import type { ApiResponse } from "../types/auth";
import type { CartItem } from "../types";

type BackendCartItem = {
  medicine_id: number;
  name: string;
  batch: string;
  mrp: number;
  ptr: number;
  stock: number;
  packing: string;
  max_discount_percent: number;
  expiry_date: string;
  quantity: number;
  line_total: number;
};

type BackendCart = {
  items: BackendCartItem[];
  total_items: number;
  total_amount: number;
};

export function mapBackendCart(cart: BackendCart): CartItem[] {
  return cart.items.map((item) => ({
    medicineId: String(item.medicine_id),
    name: item.name,
    sku: item.batch,
    qty: item.quantity,
    pack: item.packing,
    unitPrice: item.quantity > 0 ? item.line_total / item.quantity : item.ptr,
    amount: item.line_total,
    stock: item.stock,
    status: item.stock <= 20 ? "Limited" : "In Stock",
  }));
}

export const cartService = {
  async getCart() {
    const response = await api.get<ApiResponse<BackendCart>>("/cart");
    return mapBackendCart(response.data.data);
  },

  async addItem(medicineId: string, quantity: number) {
    const response = await api.post<ApiResponse<BackendCart>>("/cart/add", {
      medicine_id: Number(medicineId),
      quantity,
    });
    return mapBackendCart(response.data.data);
  },

  async updateItem(medicineId: string, quantity: number) {
    if (quantity <= 0) return this.removeItem(medicineId);

    const response = await api.put<ApiResponse<BackendCart>>("/cart/update", {
      medicine_id: Number(medicineId),
      quantity,
    });
    return mapBackendCart(response.data.data);
  },

  async removeItem(medicineId: string) {
    const response = await api.delete<ApiResponse<BackendCart>>("/cart/remove", {
      data: { medicine_id: Number(medicineId) },
    });
    return mapBackendCart(response.data.data);
  },

  async clearCart(): Promise<CartItem[]> {
    const currentItems = await this.getCart();
    for (const item of currentItems) {
      await this.removeItem(item.medicineId);
    }
    return [];
  },
};
