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
const csrfCookieName = "csrfToken";
let accessToken: string | null = null;

if (typeof window !== "undefined") {
  localStorage.removeItem(legacyAccessTokenKey);
}

export const tokenStorage = {
  get() {
    return accessToken;
  },
  set(token: string) {
    accessToken = token;
  },
  clear() {
    accessToken = null;
    localStorage.removeItem(legacyAccessTokenKey);
  },
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

function readCookie(name: string) {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

function isCsrfProtectedUrl(url?: string) {
  return Boolean(url?.includes("/auth/refresh-token") || url?.includes("/auth/logout"));
}

function getCsrfHeaders() {
  const token = readCookie(csrfCookieName);
  return token ? { "X-CSRF-Token": token } : {};
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const csrfToken = readCookie(csrfCookieName);
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
      const response = await axios.post<ApiResponse<{ accessToken: string; user: { role: string } }>>(
        `${api.defaults.baseURL}/auth/refresh-token`,
        {},
        { withCredentials: true, headers: getCsrfHeaders() },
      );

      if (response.data.data.user.role !== "ADMIN") {
        tokenStorage.clear();
        window.location.assign("/login");
        return Promise.reject(new ApiError("Only admin users can access the admin portal", 403));
      }

      tokenStorage.set(response.data.data.accessToken);
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
