import { useEffect, useState } from "react";
import { clearAuth, getUser, isAuthenticated, saveUser } from "../lib/auth";
import { authService } from "../services/authService";
import type { User } from "../types/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => getUser());

  useEffect(() => {
    if (!isAuthenticated()) return;

    let cancelled = false;

    authService
      .getProfile()
      .then((profile) => {
        if (profile.role !== "EMPLOYEE") {
          clearAuth();
          if (!cancelled) setUser(null);
          return;
        }

        saveUser(profile);
        if (!cancelled) setUser(profile);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, isAuthenticated: isAuthenticated() };
}
