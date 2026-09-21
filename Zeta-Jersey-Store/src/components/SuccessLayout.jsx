import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout, { AuthTitle } from "./AuthLayout";

export default function SuccessLayout({
  image,
  imageAlt,
  title,
  subtitle,
  redirectTo = "/login",
  delay = 0,
}) {
  const navigate = useNavigate();
  const [count, setCount] = useState(delay);

  useEffect(() => {
    if (count <= 0) {
      navigate(redirectTo, { replace: true });
      return;
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [count, navigate, redirectTo]);

  return (
    <AuthLayout image={image} imageAlt={imageAlt} showBackButton>
      <AuthTitle>{title}</AuthTitle>
      {subtitle && <p className="mt-6 text-lg text-gray-900">{subtitle}</p>}
      <p role="status" aria-live="polite" className="mt-4 text-base text-gray-500">
        Redirecting in {count}s…
      </p>
    </AuthLayout>
  );
}