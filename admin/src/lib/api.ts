import axios, { type InternalAxiosRequestConfig } from "axios";
import type { AxiosError } from "axios";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta: Record<string, unknown> | null;
};

export type ApiResult<T> = {
  data: T;
  meta: Record<string, unknown> | null;
};

export type ListMeta = {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type RetryableRequest = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

type RefreshPayload = { accessToken: string; csrfToken: string; user: { role: string } };

export class ApiError extends Error {
  status?: number;
  errors?: unknown;

  constructor(message: string, status?: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const legacyAccessTokenKey = "admin_access_token";
const portalRoleHeader = { "X-Portal-Role": "ADMIN" };
let accessToken: string | null = null;
let csrfToken: string | null = null;
let refreshRequest: Promise<{ data: ApiResponse<RefreshPayload> }> | null = null;

if (typeof window !== "undefined") {
  localStorage.removeItem(legacyAccessTokenKey);
}

function getApiBaseUrl() {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://localhost:5001/api/v1" : "")).trim();
  if (!apiBaseUrl) {
    const message = "VITE_API_BASE_URL is required. Refusing to call relative frontend URLs for API requests.";
    console.error(message);
    throw new Error(message);
  }
  if (import.meta.env.PROD && !/^https?:\/\//i.test(apiBaseUrl)) {
    const message = "VITE_API_BASE_URL must be an absolute URL in production.";
    console.error(message);
    throw new Error(message);
  }
  return apiBaseUrl;
}

const apiBaseUrl = getApiBaseUrl();

export const tokenStorage = {
  get() {
    return accessToken;
  },
  set(token: string, nextCsrfToken?: string) {
    accessToken = token;
    if (nextCsrfToken !== undefined) {
      csrfToken = nextCsrfToken;
    }
  },
  setAuth(auth: { accessToken: string; csrfToken: string }) {
    accessToken = auth.accessToken;
    csrfToken = auth.csrfToken;
  },
  clear() {
    accessToken = null;
    csrfToken = null;
    localStorage.removeItem(legacyAccessTokenKey);
  },
};

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    ...portalRoleHeader,
  },
});

function isCsrfProtectedUrl(url?: string) {
  return Boolean(url?.includes("/auth/refresh-token") || url?.includes("/auth/logout"));
}

function getCsrfHeaders() {
  return csrfToken ? { "X-CSRF-Token": csrfToken } : {};
}

function refreshSession() {
  refreshRequest ??= axios
    .post<ApiResponse<RefreshPayload>>(
      `${apiBaseUrl}/auth/refresh-token`,
      {},
      { withCredentials: true, headers: { ...portalRoleHeader, ...getCsrfHeaders() } },
    )
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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

      if (response.data.data.user.role !== "ADMIN") {
        tokenStorage.clear();
        window.location.assign("/login");
        return Promise.reject(new ApiError("Only admin users can access the admin portal", 403));
      }

      tokenStorage.setAuth(response.data.data);
      originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();
      window.location.assign("/login");
      return Promise.reject(refreshError);
    }
  },
);

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; errors?: unknown }>;
    const message = axiosError.response?.data?.message ?? axiosError.message ?? "Request failed";
    return new ApiError(message, axiosError.response?.status, axiosError.response?.data?.errors);
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError("Request failed");
}

export async function apiRequest<T>(request: Promise<{ data: ApiResponse<T> }>) {
  try {
    const response = await request;
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export async function apiResult<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<ApiResult<T>> {
  try {
    const response = await request;
    return {
      data: response.data.data,
      meta: response.data.meta,
    };
  } catch (error) {
    throw toApiError(error);
  }
}

export function readListMeta(meta: Record<string, unknown> | null): ListMeta {
  return {
    page: typeof meta?.page === "number" ? meta.page : undefined,
    limit: typeof meta?.limit === "number" ? meta.limit : undefined,
    total: typeof meta?.total === "number" ? meta.total : undefined,
    totalPages: typeof meta?.totalPages === "number" ? meta.totalPages : undefined,
  };
}

export { api };
