import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ApiError, tokenStorage } from "../lib/api";
import { authService } from "../services/authService";
import type { UserProfile } from "../services/authService";

type AuthContextValue = {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Authentication failed";
}

function isAdmin(user: UserProfile | null) {
  return user?.role === "ADMIN";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const loadAdminProfile = useCallback(async () => {
    const profile = await authService.getProfile();
    if (!isAdmin(profile)) {
      throw new ApiError("Only admin users can access the admin portal", 403);
    }
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    async function restoreSession() {
      const token = tokenStorage.get();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        await loadAdminProfile();
      } catch {
        try {
          const refreshed = await authService.refreshToken();
          tokenStorage.set(refreshed.accessToken);
          await loadAdminProfile();
        } catch {
          clearSession();
        }
      } finally {
        setIsLoading(false);
      }
    }

    void restoreSession();
  }, [clearSession, loadAdminProfile]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await authService.login(email, password);
        tokenStorage.set(result.accessToken);

        const profile = await authService.getProfile();
        if (!isAdmin(profile)) {
          try {
            await authService.logout();
          } catch {
            // The frontend session must be cleared even if the backend logout fails.
          }
          clearSession();
          throw new ApiError("Only admin users can access the admin portal", 403);
        }

        setUser(profile);
      } catch (authError) {
        clearSession();
        setError(getErrorMessage(authError));
        throw authError;
      } finally {
        setIsLoading(false);
      }
    },
    [clearSession],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authService.logout();
    } catch {
      // Logout should always clear the local admin session.
    } finally {
      clearSession();
      setIsLoading(false);
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: isAdmin(user),
      isLoading,
      error,
      login,
      logout,
      clearError: () => setError(null),
    }),
    [error, isLoading, login, logout, user],
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
