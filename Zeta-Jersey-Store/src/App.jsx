import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./components/RouteGuards";
import MainLayout from "./components/MainLayout";

import LandingPage from "./pages/LandingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AllProductsPage from "./pages/AllProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import EmailConfirmation from "./pages/EmailConfirmation";
import Dashboard from "./pages/Dashboard";
import AdminApp from "./admin/AdminApp";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";
import ProfileBody from "./pages/ProfileBody";
import RegisterSuccess from "./pages/RegisterSuccess";
import LoginSuccess from "./pages/LoginSuccess";
import ResetPasswordSuccess from "./pages/ResetPasswordSuccess";
import ChangePasswordSuccess from "./pages/ChangePasswordSuccess";
import VerifyEmailSuccess from "./pages/VerifyEmailSuccess";






export default function App() {
  const devOnlyProfileBody = import.meta.env.DEV ? <ProfileBody /> : <Navigate to="/login" replace />;

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp />} />
      {/* Store routes — public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/products" element={<AllProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

      {/* Guests only — full-bleed auth pages, no navbar */}
      <Route element={<GuestRoute />}>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Open to everyone — magic link may open in any session state */}
      <Route path="/email-confirmation" element={<EmailConfirmation />} />
      <Route path="/change-password" element={<ChangePassword />} />

      <Route path="/register-success" element={<RegisterSuccess />} />
      <Route path="/login-success" element={<LoginSuccess />} />
      
      <Route path="/reset-password-success" element={<ResetPasswordSuccess />} />

      <Route path="/change-password-success" element={<ChangePasswordSuccess />} />

      <Route path="/verify-email-success" element={<VerifyEmailSuccess />} />

      {import.meta.env.DEV && <Route path="/profilebody" element={<ProfileBody />} />}

      {/* Authenticated — wrapped in MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfileBody />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
