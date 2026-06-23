import { api, apiRequest } from "../lib/api";

export type AdminRole = "ADMIN" | "EMPLOYEE" | "RETAILER";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  retailerId: string | null;
};

export type UserProfile = AuthUser & {
  phone?: string | null;
  status?: string;
  retailer?: unknown;
  employeeProfile?: unknown;
};

type LoginResponse = {
  user: AuthUser;
  accessToken: string;
};

type RefreshResponse = LoginResponse;

let refreshPromise: Promise<RefreshResponse> | null = null;

export const authService = {
  login(email: string, password: string) {
    return apiRequest<LoginResponse>(api.post("/auth/login", { email, password }));
  },

  logout() {
    return apiRequest<null>(api.post("/auth/logout"));
  },

  refreshToken() {
    refreshPromise ??= apiRequest<RefreshResponse>(api.post("/auth/refresh-token", {})).finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  },

  getProfile() {
    return apiRequest<UserProfile>(api.get("/users/profile"));
  },
};
