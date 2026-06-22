import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AUTH_CHANGED_EVENT, clearAuth, getAccessToken, getUser, saveAuth, saveUser } from "../lib/auth";
import { authService } from "../services/authService";
import { profileService } from "../services/profileService";
import type { RetailerProfile } from "../types";
import type { User } from "../types/auth";
import { AuthContext, type AuthContextValue } from "./authContext";

function profileToUser(profile: RetailerProfile): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    retailerId: profile.retailerId,
    phone: profile.phone,
    status: profile.status,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getUser());
  const [profile, setProfile] = useState<RetailerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    setIsLoading(true);

    try {
      const refreshed = await authService.refreshToken();
      if (refreshed.user.role !== "RETAILER" || !refreshed.user.retailerId) {
        clearAuth(false);
        setUser(null);
        setProfile(null);
        return null;
      }

      saveAuth(refreshed, false);
      const nextProfile = await profileService.getProfile();

      if (nextProfile.role !== "RETAILER" || !nextProfile.retailerId) {
        clearAuth(false);
        setUser(null);
        setProfile(null);
        return null;
      }

      const nextUser = profileToUser(nextProfile);
      saveUser(nextUser);
      setUser(nextUser);
      setProfile(nextProfile);
      return nextProfile;
    } catch {
      clearAuth(false);
      setUser(null);
      setProfile(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void restoreSession();
    }, 0);

    function handleAuthChanged() {
      void restoreSession();
    }

    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged);
    };
  }, [restoreSession]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      setUser(null);
      setProfile(null);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      isAuthenticated: Boolean(user && getAccessToken()),
      isLoading,
      logout,
      refreshProfile: restoreSession,
    }),
    [isLoading, logout, profile, restoreSession, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
