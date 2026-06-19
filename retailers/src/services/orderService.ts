import { api } from "../lib/api";
import type { ApiResponse } from "../types/auth";
import type { CartItem, CreatedOrder, OrderInvoice, PaymentMethod, RetailerOrder } from "../types";

const CREATED_ORDER_KEY = "shweta-retailer-created-order";

type CreateOrderPayload = {
  paymentMethod: PaymentMethod;
  deliveryAddressId?: string;
  items: Array<{
    medicineId: string;
    quantity: number;
  }>;
};

export function saveCreatedOrder(order: CreatedOrder) {
  window.sessionStorage.setItem(CREATED_ORDER_KEY, JSON.stringify(order));
}

export function getCreatedOrder() {
  const rawOrder = window.sessionStorage.getItem(CREATED_ORDER_KEY);
  if (!rawOrder) return null;

  try {
    return JSON.parse(rawOrder) as CreatedOrder;
  } catch {
    window.sessionStorage.removeItem(CREATED_ORDER_KEY);
    return null;
  }
}

export const orderService = {
  async createOrder(items: CartItem[], paymentMethod: PaymentMethod, deliveryAddressId?: string) {
    const payload: CreateOrderPayload = {
      paymentMethod,
      deliveryAddressId,
      items: items.map((item) => ({
        medicineId: item.medicineId,
        quantity: item.qty,
      })),
    };

    const response = await api.post<ApiResponse<CreatedOrder>>("/orders", payload);
    return response.data.data;
  },

  async getOrders() {
    const response = await api.get<ApiResponse<RetailerOrder[]>>("/orders", {
      params: { limit: 100 },
    });
    return response.data.data;
  },

  async getOrderInvoice(orderId: string) {
    const response = await api.get<ApiResponse<OrderInvoice>>(`/orders/${orderId}/invoice`);
    return response.data.data;
  },

  async downloadOrderInvoicePdf(orderId: string) {
    const response = await api.get<Blob>(`/orders/${orderId}/invoice/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },
};
