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
  accessToken?: string;
  csrfToken?: string;
};

export type LoginPayload = {
  phone: string;
  password: string;
};

export type RetailerSignupPayload = {
  ownerName: string;
  email: string;
  phone: string;
  pharmacyName: string;
  gstNumber?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  password: string;
  confirmPassword: string;
  otpVerificationToken?: string;
};

export type SignupOtpRequestPayload = {
  phone: string;
};

export type SignupOtpVerifyPayload = {
  phone: string;
  otp: string;
};

export type SignupOtpVerifyResponse = {
  verificationToken: string;
  expiresInSeconds: number;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  token: string;
  password: string;
};
