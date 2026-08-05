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

const apiBaseUrl = getApiBaseUrl();

export const api = axios.create({
  baseURL: apiBaseUrl,
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
