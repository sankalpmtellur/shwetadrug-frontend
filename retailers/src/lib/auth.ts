import type { AuthResponse, User } from "../types/auth";

const ACCESS_TOKEN_KEY = "sdd_retailer_access_token";
const REFRESH_TOKEN_KEY = "sdd_retailer_refresh_token";
const USER_KEY = "sdd_retailer_user";
export const AUTH_CHANGED_EVENT = "sdd-retailer-auth-changed";

function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function saveAuth(auth: AuthResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  notifyAuthChanged();
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getUser(): User | null {
  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    clearAuth();
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthChanged();
}

export function isAuthenticated() {
  return Boolean(getAccessToken() && getUser());
}

export function getUserRole() {
  return getUser()?.role ?? null;
}
