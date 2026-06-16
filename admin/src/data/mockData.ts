import type { InventoryDecision, Kpi, Retailer, RevenuePoint, SalesChannel } from "../types";

export const kpis: Kpi[] = [
  { label: "Total Revenue", value: "Rs. 42.8M", hint: "This month", tone: "blue" },
  { label: "Today's Revenue", value: "Rs. 1.42M", hint: "128 orders", tone: "green" },
  { label: "Active Retailers", value: "684", hint: "+28 this month", tone: "blue" },
  { label: "Inventory Value", value: "Rs. 18.7M", hint: "1,248 SKUs", tone: "orange" },
];

export const salesChannels: SalesChannel[] = [
  { channel: "Retailer Portal", orders: 482, revenue: "Rs. 22.4M", margin: "18.4%", trend: "+14%" },
  { channel: "Phone Orders", orders: 164, revenue: "Rs. 7.2M", margin: "15.1%", trend: "+4%" },
  { channel: "Repeat Contracts", orders: 93, revenue: "Rs. 13.2M", margin: "21.8%", trend: "+19%" },
];

export const inventoryDecisions: InventoryDecision[] = [
  { sku: "AMX-500-100CP", name: "Amoxicillin 500mg", daysCover: 42, value: "Rs. 2.8M", action: "Healthy" },
  { sku: "ATO-20-30PK", name: "Atorvastatin 20mg", daysCover: 9, value: "Rs. 0.42M", action: "Purchase" },
  { sku: "PAN-40-15ST", name: "Pantoprazole 40mg", daysCover: 0, value: "Rs. 0.00M", action: "Stockout" },
  { sku: "TEL-40-30PK", name: "Telmisartan 40mg", daysCover: 12, value: "Rs. 0.64M", action: "Watch" },
];

export const retailers: Retailer[] = [
  { name: "CarePlus Medicals", area: "Indiranagar", monthlyOrders: 64, outstanding: "Rs. 2.4M", status: "Active" },
  { name: "Namma Pharma", area: "Jayanagar", monthlyOrders: 51, outstanding: "Rs. 1.8M", status: "Active" },
  { name: "Apollo Partner Store", area: "Koramangala", monthlyOrders: 72, outstanding: "Rs. 3.1M", status: "Active" },
  { name: "MedTrust", area: "Whitefield", monthlyOrders: 28, outstanding: "Rs. 0.9M", status: "Review" },
];

export const monthlyRevenue: RevenuePoint[] = [
  { label: "Jan", value: 42 },
  { label: "Feb", value: 58 },
  { label: "Mar", value: 45 },
  { label: "Apr", value: 72 },
  { label: "May", value: 66 },
  { label: "Jun", value: 88 },
  { label: "Jul", value: 76 },
  { label: "Aug", value: 96 },
  { label: "Sep", value: 84 },
  { label: "Oct", value: 105 },
  { label: "Nov", value: 118 },
  { label: "Dec", value: 132 },
];

export const weeklyRevenue: RevenuePoint[] = [
  { label: "Mon", value: 16 },
  { label: "Tue", value: 22 },
  { label: "Wed", value: 18 },
  { label: "Thu", value: 27 },
  { label: "Fri", value: 31 },
  { label: "Sat", value: 24 },
  { label: "Sun", value: 14 },
];
