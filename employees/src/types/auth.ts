export type UserRole = "ADMIN" | "EMPLOYEE" | "RETAILER";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  retailerId?: string | null;
  phone?: string | null;
  status?: string;
  employeeProfile?: {
    employeeCode: string;
    designation: string;
    department: string;
  } | null;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta: Record<string, unknown> | null;
  errors?: unknown;
};

export type AuthResponse = {
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};
