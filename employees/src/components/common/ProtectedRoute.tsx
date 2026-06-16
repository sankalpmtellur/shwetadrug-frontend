import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { clearAuth, getUserRole, isAuthenticated } from "../../lib/auth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (getUserRole() !== "EMPLOYEE") {
    clearAuth();
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
