import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
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
  function Logout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
      logout().finally(() => navigate("/", { replace: true }));
    }, [logout, navigate]);
    return null;
  }

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
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Open to everyone — magic link may open in any session state */}
      <Route path="/auth/email-confirmation" element={<EmailConfirmation />} />
      <Route path="/auth/change-password" element={<ChangePassword />} />

      <Route path="/auth/register-success" element={<RegisterSuccess />} />
      <Route path="/auth/login-success" element={<LoginSuccess />} />
      
      <Route path="/auth/reset-password-success" element={<ResetPasswordSuccess />} />

      <Route path="/auth/change-password-success" element={<ChangePasswordSuccess />} />

      <Route path="/auth/verify-email-success" element={<VerifyEmailSuccess />} />
      <Route path="/auth/logout" element={<Logout />} />



      {import.meta.env.DEV && <Route path="/profilebody" element={<ProfileBody />} />}

      {/* Authenticated — wrapped in MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<ProfileBody />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
