import type { AuthResponse, User } from "../types/auth";

const LEGACY_ACCESS_TOKEN_KEY = "sdd_employee_access_token";
const LEGACY_REFRESH_TOKEN_KEY = "sdd_employee_refresh_token";
const USER_KEY = "sdd_employee_user";

if (typeof window !== "undefined") {
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
}

export function saveAuth(auth: AuthResponse) {
  localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
}

export function saveUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
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
  localStorage.removeItem(LEGACY_ACCESS_TOKEN_KEY);
  localStorage.removeItem(LEGACY_REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
