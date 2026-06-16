import { api } from "../lib/api";
import type { ApiResponse } from "../types/auth";
import type { CartItem } from "../types";

type BackendCartItem = {
  id: string;
  medicineId: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  medicine: {
    id: string;
    sku: string;
    name: string;
    genericName: string;
    packSize: string;
    status: string;
    category: string;
    manufacturer: string;
  };
};

type BackendCart = {
  id: string;
  retailerId: string;
  items: BackendCartItem[];
  subtotal: number;
  createdAt: string;
  updatedAt: string;
};

export function mapBackendCart(cart: BackendCart): CartItem[] {
  return cart.items.map((item) => ({
    medicineId: item.medicineId,
    name: item.medicine.name,
    sku: item.medicine.sku,
    qty: item.quantity,
    pack: item.medicine.packSize,
    unitPrice: item.unitPrice,
    amount: item.amount,
    status: "In Stock",
  }));
}

export const cartService = {
  async getCart() {
    const response = await api.get<ApiResponse<BackendCart>>("/cart");
    return mapBackendCart(response.data.data);
  },

  async addItem(medicineId: string, quantity: number) {
    const response = await api.post<ApiResponse<BackendCart>>("/cart/items", { medicineId, quantity });
    return mapBackendCart(response.data.data);
  },

  async updateItem(medicineId: string, quantity: number) {
    const response = await api.patch<ApiResponse<BackendCart>>(`/cart/items/${medicineId}`, { quantity });
    return mapBackendCart(response.data.data);
  },

  async removeItem(medicineId: string) {
    const response = await api.delete<ApiResponse<BackendCart>>(`/cart/items/${medicineId}`);
    return mapBackendCart(response.data.data);
  },

  async clearCart() {
    const response = await api.delete<ApiResponse<BackendCart>>("/cart");
    return mapBackendCart(response.data.data);
  },
};
