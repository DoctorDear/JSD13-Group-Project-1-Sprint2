import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./contexts/authContext.js";
import { ProtectedRoute, GuestRoute, AdminRoute } from "./components/RouteGuards";

import LandingPage from "./pages/LandingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SubmitReviewPage from "./pages/SubmitReviewPage";
import AllProductsPage from "./pages/AllProductsPage";
import CartPage from "./pages/CartPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import EmailConfirmation from "./pages/EmailConfirmation";
import AdminApp from "./admin/AdminApp";
import Settings from "./pages/Settings";
import ChangePassword from "./pages/ChangePassword";
import RegisterSuccess from "./pages/RegisterSuccess";
import LoginSuccess from "./pages/LoginSuccess";
import ResetPasswordSuccess from "./pages/ResetPasswordSuccess";
import ChangePasswordSuccess from "./pages/ChangePasswordSuccess";
import VerifyEmailSuccess from "./pages/VerifyEmailSuccess";

const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ProfileBody = lazy(() => import("./pages/ProfileBody"));
const loadingPage = <div className="p-8 text-center text-zeta-muted">Loading...</div>;






function Logout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    logout().finally(() => navigate("/", { replace: true }));
  }, [logout, navigate]);
  return null;
}

export default function App() {
  return (
    <Routes>
      {/* Admin routes — restricted to role: admin */}
      <Route element={<AdminRoute />}>
        <Route path="/admin/*" element={<AdminApp />} />
      </Route>
      {/* Store routes — public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
      <Route path="/products" element={<AllProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/cart" element={<CartPage />} />
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



      {import.meta.env.DEV && <Route path="/profilebody" element={<Suspense fallback={loadingPage}><ProfileBody /></Suspense>} />}

      {/* Authenticated pages */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<Suspense fallback={loadingPage}><CheckoutPage /></Suspense>} />
        <Route path="/products/:id/review" element={<SubmitReviewPage />} />
        <Route path="/profile" element={<Suspense fallback={loadingPage}><ProfileBody /></Suspense>} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
