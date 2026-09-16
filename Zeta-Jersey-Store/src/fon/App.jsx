import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./spagetti-code/pages/Register";
import Login from "./spagetti-code/pages/Login";
import ResetPassword from "./spagetti-code/pages/ResetPassword";
import VerifyEmail from "./spagetti-code/pages/VerifyEmail";
import EmailConfirmation from "./spagetti-code/pages/EmailConfirmation";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default landing → register */}
        <Route path="/" element={<Navigate to="/register" replace />} />

        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3A0CA3] via-[#6432D4] to-[#7B7BFF] flex flex-col items-center justify-center text-white p-6 text-center">
      <h1 className="text-7xl font-extrabold drop-shadow-md">404</h1>
      <p className="mt-4 text-lg">This page doesn&apos;t exist.</p>
      <a
        href="/login"
        className="mt-8 rounded-lg bg-[#1E0A73] px-8 py-4 font-semibold hover:bg-[#2A0F7A] transition"
      >
        Go to login
      </a>
    </div>
  );
}