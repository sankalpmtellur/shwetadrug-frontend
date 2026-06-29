export type UserRole = "ADMIN" | "EMPLOYEE" | "RETAILER";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  retailerId: string | null;
  phone?: string | null;
  status?: string;
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
  accessToken: string;
  csrfToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RetailerSignupPayload = {
  ownerName: string;
  email: string;
  phone: string;
  shopName: string;
  gstNumber?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};
