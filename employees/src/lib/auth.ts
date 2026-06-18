import type { AuthResponse, User } from "../types/auth";

const ACCESS_TOKEN_KEY = "sdd_employee_access_token";
const LEGACY_REFRESH_TOKEN_KEY = "sdd_employee_refresh_token";
const USER_KEY = "sdd_employee_user";

export function saveAuth(auth: AuthResponse) {
  localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
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
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getAccessToken() && getUser());
}

export function getUserRole() {
  return getUser()?.role ?? null;
}
