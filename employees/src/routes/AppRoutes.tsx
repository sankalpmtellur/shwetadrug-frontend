import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";
import Expiry from "../pages/Expiry";
import Inventory from "../pages/Inventory";
import Login from "../pages/Login";
import Orders from "../pages/Orders";

function protectedPage(element: ReactElement) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route element={protectedPage(<DashboardLayout />)}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/expiry" element={<Expiry />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
