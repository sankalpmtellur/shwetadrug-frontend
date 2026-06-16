export type Kpi = {
  label: string;
  value: string;
  hint: string;
  tone: "blue" | "green" | "orange";
};

export type SalesChannel = {
  channel: string;
  orders: number;
  revenue: string;
  margin: string;
  trend: string;
};

export type InventoryDecision = {
  sku: string;
  name: string;
  daysCover: number;
  value: string;
  action: "Healthy" | "Purchase" | "Stockout" | "Watch";
};

export type Retailer = {
  name: string;
  area: string;
  monthlyOrders: number;
  outstanding: string;
  status: "Active" | "Review";
};

export type RevenuePoint = {
  label: string;
  value: number;
};
