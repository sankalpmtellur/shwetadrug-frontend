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
};

export const authService = {
  login(email: string, password: string) {
    return apiRequest<LoginResponse>(api.post("/admin/login", { email, password }));
  },

  logout() {
    return apiRequest<null>(api.post("/admin/logout"));
  },

  getProfile() {
    return apiRequest<UserProfile>(api.get("/admin/profile"));
  },
};
