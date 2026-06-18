import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAuth, getAccessToken, saveAuth } from "./auth";
import type { ApiResponse, AuthResponse } from "../types/auth";

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await axios.post<ApiResponse<AuthResponse>>(
        `${api.defaults.baseURL}/auth/refresh-token`,
        {},
        { withCredentials: true },
      );

      if (response.data.data.user.role !== "RETAILER") {
        clearAuth();
        window.location.assign("/login");
        return Promise.reject(refreshErrorForRole());
      }

      saveAuth(response.data.data);
      originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearAuth();
      window.location.assign("/login");
      return Promise.reject(refreshError);
    }
  },
);

function refreshErrorForRole() {
  return new Error("Please use the correct portal for this account.");
}
