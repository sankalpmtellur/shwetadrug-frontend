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
  User,
} from "../types/auth";

type BackendRetailer = {
  id: number;
  retailer_code: string;
  owner_name: string;
  pharmacy_name: string;
  phone: string;
  email: string | null;
  address: string;
  status: string;
};

function toAuthResponse(retailer: BackendRetailer): AuthResponse {
  const user: User = {
    id: String(retailer.id),
    email: retailer.email ?? "",
    name: retailer.owner_name,
    role: "RETAILER",
    retailerId: String(retailer.id),
    phone: retailer.phone,
    status: retailer.status,
  };

  return { user };
}

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<ApiResponse<BackendRetailer>>("/retailer/login", payload);
    return toAuthResponse(response.data.data);
  },

  async logout() {
    await api.post("/retailer/logout");
  },

  async refreshToken() {
    const response = await api.get<ApiResponse<BackendRetailer>>("/retailer/profile");
    return toAuthResponse(response.data.data);
  },

  async retailerSignup(payload: RetailerSignupPayload) {
    const address = [payload.address, payload.city, payload.state, payload.pincode].filter(Boolean).join(", ");
    const response = await api.post("/retailer/signup", {
      owner_name: payload.ownerName,
      pharmacy_name: payload.pharmacyName,
      phone: payload.phone,
      email: payload.email || null,
      address,
      password: payload.password,
    });
    return response.data;
  },

  async requestSignupOtp(_payload: SignupOtpRequestPayload) {
    return { success: true, message: "Mobile verification skipped for this launch." };
  },

  async verifySignupOtp(payload: SignupOtpVerifyPayload): Promise<SignupOtpVerifyResponse> {
    return {
      verificationToken: `verified-${payload.phone}`,
      expiresInSeconds: 3600,
    };
  },

  async forgotPassword(_payload: ForgotPasswordPayload) {
    throw new Error("Password reset is handled manually for launch.");
  },

  async resetPassword(_payload: ResetPasswordPayload) {
    throw new Error("Password reset is handled manually for launch.");
  },
};
