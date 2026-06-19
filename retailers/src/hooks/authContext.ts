import { createContext } from "react";
import type { RetailerProfile } from "../types";
import type { User } from "../types/auth";

export type AuthContextValue = {
  user: User | null;
  profile: RetailerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<RetailerProfile | null>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
