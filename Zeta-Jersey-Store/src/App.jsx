import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { useAuth } from "./contexts/authContext.js";
import { ProtectedRoute, GuestRoute, AdminRoute } from "./components/RouteGuards";

import LandingPage from "./pages/LandingPage";
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const SubmitReviewPage = lazy(() => import("./pages/SubmitReviewPage"));
const AllProductsPage = lazy(() => import("./pages/AllProductsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const OrderConfirmationPage = lazy(() => import("./pages/OrderConfirmationPage"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const EmailConfirmation = lazy(() => import("./pages/EmailConfirmation"));
const AdminApp = lazy(() => import("./admin/AdminApp"));
const Settings = lazy(() => import("./pages/Settings"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const RegisterSuccess = lazy(() => import("./pages/RegisterSuccess"));
const LoginSuccess = lazy(() => import("./pages/LoginSuccess"));
const ResetPasswordSuccess = lazy(() => import("./pages/ResetPasswordSuccess"));
const ChangePasswordSuccess = lazy(() => import("./pages/ChangePasswordSuccess"));
const VerifyEmailSuccess = lazy(() => import("./pages/VerifyEmailSuccess"));
import CartFeedbackHost from "./components/CartFeedbackHost.jsx";

const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const ProfileBody = lazy(() => import("./pages/ProfileBody"));
const loadingPage = <div role="status" className="flex min-h-[60vh] items-center justify-center gap-3 text-zeta-muted"><span aria-hidden="true" className="loading loading-spinner text-zeta-main" />Loading…</div>;

function ScrollToTop() {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (pathname === "/products" && navigationType === "POP") return;
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, search, navigationType]);

  return null;
}

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
    <>
      <ScrollToTop />
      <CartFeedbackHost />
      <Suspense fallback={loadingPage}>
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
    </Suspense>
    </>
  );
}
