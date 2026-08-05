import axios from "axios";
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

function getApiBaseUrl() {
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:8000/api" : "")).trim();
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

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

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
