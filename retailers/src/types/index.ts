export type Medicine = {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: string;
  sku: string;
  pack: string;
  price: number;
  mrp: number;
  stock: number;
  batch: string;
  expiry: string;
  gst: number;
  margin: number;
  alternatives: string[];
  status: "In Stock" | "Limited" | "Out";
};

export type CartItem = {
  medicineId: string;
  name: string;
  sku: string;
  qty: number;
  pack: string;
  unitPrice: number;
  amount: number;
  status: "In Stock" | "Limited";
};

export type DefaultAddress = {
  id: string;
  address: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export type RetailerProfile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: "ADMIN" | "EMPLOYEE" | "RETAILER";
  status: string;
  retailerId: string | null;
  retailer: {
    id: string;
    code: string;
    pharmacyName: string;
    ownerName: string;
    gstNumber: string | null;
    drugLicenseNumber: string;
    status: string;
    defaultAddress: DefaultAddress | null;
  } | null;
};

export type CreatedOrder = {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: number;
  createdAt: string;
};

export type BackendOrderStatus =
  | "PENDING"
  | "VERIFIED"
  | "PICKING"
  | "PACKED"
  | "DISPATCHED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type OrderItem = {
  id: string;
  medicineId: string;
  medicineName: string;
  sku: string;
  packSize: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type RetailerOrder = {
  id: string;
  orderNo: string;
  status: BackendOrderStatus;
  totalAmount: number;
  placedAt: string;
  items: OrderItem[];
  invoice: {
    invoiceNo: string;
    status: string;
    issuedAt: string;
  } | null;
};

export type OrderInvoice = {
  invoice: {
    invoiceNo: string;
    status: string;
    issuedAt: string;
  };
  order: {
    id: string;
    orderNo: string;
    status: BackendOrderStatus;
    placedAt: string;
    subtotal: number;
    gstAmount: number;
    deliveryCharge: number;
    totalAmount: number;
  };
  items: Array<{
    id: string;
    medicine: {
      id: string;
      sku: string;
      name: string;
      packSize: string;
    };
    quantity: number;
    unitPrice: number;
    gstPercent: number;
    gstAmount: number;
    lineTotal: number;
  }>;
};
