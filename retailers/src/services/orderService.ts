import { api } from "../lib/api";
import type { ApiResponse } from "../types/auth";
import type { CartItem, CreatedOrder, OrderInvoice, RetailerOrder } from "../types";

const CREATED_ORDER_KEY = "shweta-retailer-created-order";

type BackendOrderItem = {
  medicine_id: number;
  name: string;
  batch: string;
  packing: string;
  quantity: number;
  ptr_at_order: number;
  discount_percent: number;
  final_price: number;
};

type BackendOrder = {
  id: number;
  order_no: string;
  order_date: string;
  total_amount: number;
  status: string;
  ordered_items?: BackendOrderItem[];
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

function mapOrderItem(item: BackendOrderItem, index: number) {
  return {
    id: `${item.medicine_id}-${index}`,
    medicineId: String(item.medicine_id),
    medicineName: item.name,
    sku: item.batch,
    packSize: item.packing,
    quantity: item.quantity,
    unitPrice: item.quantity > 0 ? item.final_price / item.quantity : item.ptr_at_order,
    lineTotal: item.final_price,
  };
}

function mapBackendOrderCartItem(item: BackendOrderItem, index: number): CartItem {
  const unitPrice = item.quantity > 0 ? item.final_price / item.quantity : item.ptr_at_order;
  return {
    medicineId: String(item.medicine_id),
    name: item.name,
    sku: item.batch || `${item.medicine_id}-${index}`,
    qty: item.quantity,
    pack: item.packing,
    unitPrice,
    amount: item.final_price,
    stock: item.quantity,
    status: "In Stock",
  };
}

function mapCreatedOrder(order: BackendOrder, fallbackItems: CartItem[] = []): CreatedOrder {
  return {
    id: String(order.id),
    orderNo: order.order_no,
    status: order.status,
    totalAmount: order.total_amount,
    createdAt: order.order_date,
    items: order.ordered_items?.length ? order.ordered_items.map(mapBackendOrderCartItem) : fallbackItems,
  };
}

function mapRetailerOrder(order: BackendOrder): RetailerOrder {
  return {
    id: String(order.id),
    orderNo: order.order_no,
    status: order.status as RetailerOrder["status"],
    totalAmount: order.total_amount,
    placedAt: order.order_date,
    items: (order.ordered_items ?? []).map(mapOrderItem),
    invoice: {
      invoiceNo: order.order_no,
      status: order.status,
      issuedAt: order.order_date,
    },
  };
}

function mapInvoice(order: RetailerOrder): OrderInvoice {
  return {
    invoice: {
      invoiceNo: order.orderNo,
      status: order.status,
      issuedAt: order.placedAt,
    },
    retailer: {
      pharmacyName: "Retailer pharmacy",
      ownerName: "Retailer",
      mobile: null,
      gstNumber: null,
      drugLicenseNumber: "-",
      addresses: [],
    },
    order: {
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      placedAt: order.placedAt,
      subtotal: order.totalAmount,
      gstAmount: 0,
      deliveryCharge: 0,
      totalAmount: order.totalAmount,
    },
    items: order.items.map((item) => ({
      id: item.id,
      medicine: {
        id: item.medicineId,
        sku: item.sku,
        name: item.medicineName,
        packSize: item.packSize,
      },
      batchNumber: item.sku,
      expiryDate: null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      gstPercent: 0,
      gstAmount: 0,
      lineTotal: item.lineTotal,
    })),
  };
}

export const orderService = {
  async createOrder(_items: CartItem[], _deliveryAddressId?: string) {
    const response = await api.post<ApiResponse<BackendOrder>>("/orders");
    return mapCreatedOrder(response.data.data, _items);
  },

  async getOrders() {
    const response = await api.get<ApiResponse<BackendOrder[]>>("/orders");
    const orders = response.data.data;

    return Promise.all(
      orders.map(async (order) => {
        const detail = await api.get<ApiResponse<BackendOrder>>(`/orders/${order.id}`);
        return mapRetailerOrder(detail.data.data);
      }),
    );
  },

  async getOrderInvoice(orderId: string) {
    const response = await api.get<ApiResponse<BackendOrder>>(`/orders/${orderId}`);
    return mapInvoice(mapRetailerOrder(response.data.data));
  },

  async downloadOrderInvoicePdf(_orderId: string): Promise<Blob> {
    throw new Error("Invoice PDF download is not available yet.");
  },
};
