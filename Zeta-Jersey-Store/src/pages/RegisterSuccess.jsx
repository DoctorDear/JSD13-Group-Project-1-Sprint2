import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout, { AuthTitle } from "../components/AuthLayout";

const HERO =
  "https://plus.unsplash.com/premium_photo-1688754304196-6caa60f756cb?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=900&q=80";

export default function RegisterSuccess() {

  return (
    <AuthLayout
      image={HERO}
      imageAlt="Athlete leaning against a chain-link fence holding a ball"
      showBackButton
    >
      <AuthTitle>
        Register
        <br />
        successfully
      </AuthTitle>

      <a
        href="http://localhost:5173/"
        className="mt-3 inline-block text-lg text-gray-900 underline underline-offset-2 font-medium hover:text-indigo-700"
      >
        Go back to shopping
      </a>
    </AuthLayout>
  );
}