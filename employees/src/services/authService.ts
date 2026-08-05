import { api } from "../lib/api";
import type { ApiResponse, AuthResponse, LoginPayload, User } from "../types/auth";

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<ApiResponse<AuthResponse>>("/employee/login", payload);
    return response.data.data;
  },

  async logout() {
    await api.post("/employee/logout");
  },

  async getProfile() {
    const response = await api.get<ApiResponse<User>>("/employee/profile");
    return response.data.data;
  },
};
