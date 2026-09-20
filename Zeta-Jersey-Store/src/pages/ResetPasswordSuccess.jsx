import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout, { AuthTitle } from "../components/AuthLayout";

const HERO =
  "https://images.unsplash.com/photo-1601634134078-19284da781f7?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=900&q=80";

const REDIRECT_AFTER = 5; // seconds

export default function ResetPasswordSuccess() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email || "";

  const [count, setCount] = useState(REDIRECT_AFTER);

  useEffect(() => {
    if (count <= 0) {
      navigate("/login", { replace: true, state: { passwordReset: true, email } });
      return;
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count, navigate, email]);

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

      {email && (
        <p className="mt-6 text-lg text-gray-900">
          The password for <span className="font-semibold">{email}</span> has been updated.
        </p>
      )}

      <p role="status" aria-live="polite" className="mt-4 text-base text-gray-500">
        Taking you to log in in {count}s…
      </p>
    </AuthLayout>
  );
}