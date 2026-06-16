import type { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Checkout from "../pages/Checkout";
import OrderConfirmed from "../pages/OrderConfirmed";
import OrderHistory from "../pages/OrderHistory";
import ForgotPassword from "../pages/ForgotPassword";
import Profile from "../pages/Profile";
import { ProtectedRoute } from "../components/common/ProtectedRoute";

function protectedPage(element: ReactElement) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={protectedPage(<Dashboard />)} />
      <Route path="/checkout" element={protectedPage(<Checkout />)} />
      <Route path="/confirmed" element={protectedPage(<OrderConfirmed />)} />
      <Route path="/orders" element={protectedPage(<OrderHistory />)} />
      <Route path="/profile" element={protectedPage(<Profile />)} />
    </Routes>
  );
}
