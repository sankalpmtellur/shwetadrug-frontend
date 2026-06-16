export type OrderStatus = "New" | "Verified" | "Picking" | "Packed" | "Dispatched";

export type OrderPriority = "High" | "Normal";

export type EmployeeOrder = {
  id: string;
  retailer: string;
  area: string;
  receivedAt: string;
  items: number;
  value: string;
  priority: OrderPriority;
  status: OrderStatus;
};

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  batch: string;
  stock: number;
  expiry: string;
  supplier: string;
  status: "Healthy" | "Low" | "Reorder";
};

export type ExpiryItem = {
  id: string;
  name: string;
  batch: string;
  expiry: string;
  stock: number;
  action: string;
  severity: "Critical" | "Warning";
};

export type ReturnItem = {
  id: string;
  retailer: string;
  reason: string;
  value: string;
  status: "Inspect" | "Credit Note" | "Approved";
};
