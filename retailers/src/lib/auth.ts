import type { AuthResponse, User } from "../types/auth";

const LEGACY_ACCESS_TOKEN_KEY = "sdd_retailer_access_token";
const LEGACY_REFRESH_TOKEN_KEY = "sdd_retailer_refresh_token";
const USER_KEY = "sdd_retailer_user";
let accessToken: string | null = null;
let csrfToken: string | null = null;
export const AUTH_CHANGED_EVENT = "sdd-retailer-auth-changed";

if (typeof window !== "undefined") {
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
}

function notifyAuthChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function saveAuth(auth: AuthResponse, notify = true) {
  accessToken = auth.accessToken;
  csrfToken = auth.csrfToken;
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  if (notify) notifyAuthChanged();
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  return accessToken;
}

export function getCsrfToken() {
  return csrfToken;
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

export function clearAuth(notify = true) {
  accessToken = null;
  csrfToken = null;
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  if (notify) notifyAuthChanged();
}

export function isAuthenticated() {
  return Boolean(accessToken);
}
