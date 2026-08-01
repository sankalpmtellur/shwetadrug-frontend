import axios from "axios";
import { clearAuth, getUser } from "./auth";

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

export const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && getUser() && !window.location.pathname.includes("/login")) {
      clearAuth();
      window.location.assign("/login");
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? fallbackForStatus(error.response?.status, fallback);
  }

  return error instanceof Error && error.message ? error.message : fallback;
}

function fallbackForStatus(status: number | undefined, fallback: string) {
  if (status === 401) return "Your session has expired. Please login again.";
  if (status === 404) return "The requested item was not found.";
  if (status === 422) return "Please check the entered details and try again.";
  if (status === 429) return "Too many requests. Please wait a moment and try again.";
  if (status && status >= 500) return "Server error. Please try again later.";
  return fallback;
}
