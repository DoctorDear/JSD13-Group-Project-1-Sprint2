<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";
import CheckoutPage from "./pages/CheckoutPage";
import CartPage from "./pages/CartPage";
import ProductDetailPage from "./pages/ProductDetailPage";
=======
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "./components/RouteGuards";
import MainLayout from "./components/MainLayout";

import LandingPage from "./pages/LandingPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
>>>>>>> d278166d94602b5894a1927be9ff60b22beea654
import OrderConfirmationPage from "./pages/OrderConfirmationPage";

import Register from "./pages/Register";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import EmailConfirmation from "./pages/EmailConfirmation";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

export default function App() {
  return (
<<<<<<< HEAD
    <div>
      <Routes>
        {/* 1. กำหนดให้หน้าแรกสุด (http://localhost:5173/) วิ่งไปที่หน้า Checkout หรือ Cart ของคุณ */}
        <Route path="/" element={<CheckoutPage />} />

        {/* 2. เส้นทางสำหรับหน้าอื่นๆ */}
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Routes>
    </div>
  );
};

export default App;
=======
    <Routes>
      {/* Store routes — public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<LandingPage />} />
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

      {/* Authenticated — wrapped in MainLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
>>>>>>> d278166d94602b5894a1927be9ff60b22beea654
