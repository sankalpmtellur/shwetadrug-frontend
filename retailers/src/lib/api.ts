import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAuth, getAccessToken, getCsrfToken, saveAuth } from "./auth";
import type { ApiResponse, AuthResponse } from "../types/auth";

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const portalRoleHeader = { "X-Portal-Role": "RETAILER" };
let refreshRequest: Promise<{ data: ApiResponse<AuthResponse> }> | null = null;

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1",
  withCredentials: true,
  headers: portalRoleHeader,
});

function isCsrfProtectedUrl(url?: string) {
  return Boolean(url?.includes("/auth/refresh-token") || url?.includes("/auth/logout"));
}

function getCsrfHeaders() {
  const token = getCsrfToken();
  return token ? { "X-CSRF-Token": token } : {};
}

function refreshSession() {
  refreshRequest ??= axios
    .post<ApiResponse<AuthResponse>>(
      `${api.defaults.baseURL}/auth/refresh-token`,
      {},
      { withCredentials: true, headers: { ...portalRoleHeader, ...getCsrfHeaders() } },
    )
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const csrfToken = getCsrfToken();
  if (csrfToken && isCsrfProtectedUrl(config.url)) {
    (config.headers as Record<string, string>)["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh-token")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await refreshSession();

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
