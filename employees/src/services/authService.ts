import { api } from "../lib/api";
import type { ApiResponse, AuthResponse, LoginPayload, User } from "../types/auth";

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", payload);
    return response.data.data;
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async refreshToken() {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/refresh-token", {});
    return response.data.data;
  },

  async getProfile() {
    const response = await api.get<ApiResponse<User>>("/users/profile");
    return response.data.data;
  },
};
