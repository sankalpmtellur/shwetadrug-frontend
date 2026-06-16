import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import Claims from "../pages/Claims";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../pages/Dashboard";
import Deliveries from "../pages/Deliveries";
import Inventory from "../pages/Inventory";
import Login from "../pages/Login";
import Medicines from "../pages/Medicines";
import Orders from "../pages/Orders";
import Payments from "../pages/Payments";
import Retailers from "../pages/Retailers";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/medicines" element={<Medicines />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/retailers" element={<Retailers />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/claims" element={<Claims />} />
        <Route path="/deliveries" element={<Deliveries />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
