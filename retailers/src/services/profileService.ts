import { api } from "../lib/api";
import type { ApiResponse } from "../types/auth";
import type { DefaultAddress, RetailerProfile } from "../types";

export type SessionDevice = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string;
  revokedAt: string | null;
  isCurrent: boolean;
};

export function formatDefaultAddress(address: DefaultAddress | null) {
  if (!address) return "Update your delivery address in profile.";

  return [address.line1, address.line2, address.city, address.state, address.pincode]
    .filter(Boolean)
    .join(", ");
}

export const profileService = {
  async getProfile() {
    const response = await api.get<ApiResponse<RetailerProfile>>("/users/profile");
    return response.data.data;
  },

  async updateProfile(payload: { name: string; phone: string }) {
    const response = await api.patch<ApiResponse<RetailerProfile>>("/users/profile", payload);
    return response.data.data;
  },

  async updateAddress(payload: { address: string; city: string; state: string; pincode: string }) {
    const response = await api.patch<ApiResponse<DefaultAddress>>("/users/profile/address", payload);
    return response.data.data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string; confirmNewPassword: string }) {
    const response = await api.patch<ApiResponse<{ id: string; email: string }>>("/users/profile/password", payload);
    return response.data.data;
  },

  async getSessions() {
    const response = await api.get<ApiResponse<SessionDevice[]>>("/users/sessions");
    return response.data.data;
  },

  async revokeSession(sessionId: string) {
    const response = await api.delete<ApiResponse<{ id: string; revoked: boolean }>>(`/users/sessions/${sessionId}`);
    return response.data.data;
  },
};
