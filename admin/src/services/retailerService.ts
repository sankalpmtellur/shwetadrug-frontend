import { api, apiResult, readListMeta } from "../lib/api";

export type RetailerAccount = {
  id: string;
  code: string;
  pharmacyName: string;
  ownerName: string;
  email: string;
  mobile: string;
  gstNumber: string | null;
  drugLicenseNumber: string | null;
  status: string;
  creditLimit: number;
  outstandingBalance: number;
  notes: string | null;
  verifiedAt: string | null;
  addresses: Array<{
    id: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }>;
  users: Array<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: string;
    status: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

export const retailerService = {
  async getRetailers() {
    const result = await apiResult<RetailerAccount[]>(api.get("/retailers", { params: { limit: 100 } }));
    return {
      items: result.data,
      meta: readListMeta(result.meta),
    };
  },

  updateRetailerStatus(id: string, status: string) {
    return apiResult<RetailerAccount>(api.patch(`/retailers/${id}`, { status }));
  },
};
