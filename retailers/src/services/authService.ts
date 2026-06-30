import { api } from "../lib/api";
import type {
  ApiResponse,
  AuthResponse,
  ForgotPasswordPayload,
  LoginPayload,
  ResetPasswordPayload,
  RetailerSignupPayload,
  SignupOtpRequestPayload,
  SignupOtpVerifyPayload,
  SignupOtpVerifyResponse,
} from "../types/auth";

let refreshPromise: Promise<AuthResponse> | null = null;

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", payload);
    return response.data.data;
  },

  async logout() {
    await api.post("/auth/logout");
  },

  async refreshToken() {
    refreshPromise ??= api.post<ApiResponse<AuthResponse>>("/auth/refresh-token", {}).then((response) => response.data.data).finally(() => {
      refreshPromise = null;
    });
    return refreshPromise;
  },

  async retailerSignup(payload: RetailerSignupPayload) {
    const response = await api.post("/auth/retailer-signup", payload);
    return response.data;
  },

  async requestSignupOtp(payload: SignupOtpRequestPayload) {
    const response = await api.post("/auth/signup/request-otp", payload);
    return response.data;
  },

  async verifySignupOtp(payload: SignupOtpVerifyPayload) {
    const response = await api.post<ApiResponse<SignupOtpVerifyResponse>>("/auth/signup/verify-otp", payload);
    return response.data.data;
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const response = await api.post("/auth/forgot-password", payload);
    return response.data;
  },

  async resetPassword(payload: ResetPasswordPayload) {
    const response = await api.post("/auth/reset-password", payload);
    return response.data;
  },
};
