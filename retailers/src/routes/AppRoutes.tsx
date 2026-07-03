import { Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../components/common/ProtectedRoute";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Checkout from "../pages/Checkout";
import OrderConfirmed from "../pages/OrderConfirmed";
import OrderHistory from "../pages/OrderHistory";
import ForgotPassword from "../pages/ForgotPassword";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmed" element={<OrderConfirmed />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
