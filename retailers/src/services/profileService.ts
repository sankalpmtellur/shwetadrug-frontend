import { api } from "../lib/api";
import type { ApiResponse } from "../types/auth";
import type { DefaultAddress, RetailerProfile } from "../types";

type BackendRetailer = {
  id: number;
  retailer_code: string;
  owner_name: string;
  pharmacy_name: string;
  phone: string;
  email: string | null;
  address: string;
  status: string;
};

export function formatDefaultAddress(address: DefaultAddress | null) {
  if (!address) return "Update your delivery address in profile.";

  return [address.line1, address.line2, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
}

function toDefaultAddress(retailer: BackendRetailer): DefaultAddress {
  return {
    id: String(retailer.id),
    address: retailer.address,
    line1: retailer.address,
    line2: null,
    city: "",
    state: "",
    pincode: "",
    isDefault: true,
  };
}

function toProfile(retailer: BackendRetailer): RetailerProfile {
  const defaultAddress = toDefaultAddress(retailer);

  return {
    id: String(retailer.id),
    email: retailer.email ?? "",
    name: retailer.owner_name,
    phone: retailer.phone,
    role: "RETAILER",
    status: retailer.status,
    retailerId: String(retailer.id),
    retailer: {
      id: String(retailer.id),
      code: retailer.retailer_code,
      pharmacyName: retailer.pharmacy_name,
      ownerName: retailer.owner_name,
      gstNumber: null,
      drugLicenseNumber: "-",
      status: retailer.status,
      defaultAddress,
    },
  };
}

export const profileService = {
  async getProfile() {
    const response = await api.get<ApiResponse<BackendRetailer>>("/retailer/profile");
    return toProfile(response.data.data);
  },

  async updateProfile(_payload: { name: string; phone: string }) {
    throw new Error("Profile editing is not available yet.");
  },

  async updateAddress(_payload: { address: string; city: string; state: string; pincode: string }) {
    throw new Error("Address editing is not available yet.");
  },

  async changePassword(_payload: { currentPassword: string; newPassword: string; confirmNewPassword: string }) {
    throw new Error("Password changes are not available yet.");
  },
};
