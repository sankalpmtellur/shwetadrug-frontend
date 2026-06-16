import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4 text-center">
        <p className="text-sm font-semibold text-muted">Restoring session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "RETAILER") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
