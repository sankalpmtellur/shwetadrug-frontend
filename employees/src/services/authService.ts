import { api } from "../lib/api";
import type { ApiResponse, AuthResponse, LoginPayload, User } from "../types/auth";

let refreshPromise: Promise<AuthResponse> | null = null;

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", payload);
    return response.data.data;
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async refreshToken() {
    refreshPromise ??= api.post<ApiResponse<AuthResponse>>("/auth/refresh-token", {}).then((response) => response.data.data).finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  },

  async getProfile() {
    const response = await api.get<ApiResponse<User>>("/users/profile");
    return response.data.data;
  },
};
