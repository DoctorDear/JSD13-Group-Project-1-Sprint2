import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout, { AuthTitle } from "../components/AuthLayout";

const HERO =
  "https://images.unsplash.com/photo-1601634134078-19284da781f7?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=900&q=80";

export default function ResetPasswordSuccess() {
 

  return (
    <AuthLayout
      image={HERO}
      imageAlt="Footballer in a green and white patterned jersey"
      showBackButton
    >
      <AuthTitle>
        Reset password
        <br />
        successfully
      </AuthTitle>
      subtitle={
        <a
          href="http://localhost:5173"
          className="mt-3 inline-block text-lg text-gray-900 underline underline-offset-2 font-medium hover:text-indigo-700"
        >
          Go back to shopping
        </a>
      }
    </AuthLayout>
  );
}