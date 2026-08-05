import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { clearAuth, getUser, saveAuth, saveUser } from "../lib/auth";
import { authService } from "../services/authService";
import type { AuthResponse, LoginPayload, User } from "../types/auth";

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isEmployee(user: User | null) {
  return user?.role === "EMPLOYEE";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const loadEmployeeProfile = useCallback(async () => {
    const profile = await authService.getProfile();
    if (!isEmployee(profile)) {
      clearSession();
      throw new Error("Please use an employee account for this portal.");
    }

    saveUser(profile);
    setUser(profile);
    return profile;
  }, [clearSession]);

  useEffect(() => {
    async function restoreSession() {
      try {
        const cachedUser = getUser();
        if (!cachedUser) return;
        await loadEmployeeProfile();
      } catch {
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, [clearSession, loadEmployeeProfile]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setIsLoading(true);

      try {
        const auth = await authService.login(payload);
        if (!isEmployee(auth.user)) {
          clearSession();
          await authService.logout().catch(() => undefined);
          throw new Error("Please use an employee account for this portal.");
        }

        saveAuth(auth);
        setUser(auth.user);
        return auth;
      } catch (error) {
        clearSession();
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [clearSession],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: isEmployee(user),
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, user],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
