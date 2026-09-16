import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import AuthLayout, { AuthTitle, AuthButton } from "../components/AuthLayout";
import FormError from "../components/FormError";
import { authService } from "../services/auth";
import { ApiError } from "../lib/api";

const HERO =
  "hhttps://plus.unsplash.com/premium_photo-1661893941582-3390d236d95f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const RESEND_COOLDOWN = 60;

export default function EmailConfirmation() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [params] = useSearchParams();

  const token = params.get("token");
  const email = params.get("email") || state?.email || "";

  const [status, setStatus] = useState(token ? "verifying" : "idle"); // idle | verifying | success | error
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const mounted = useRef(true);
  const autoFired = useRef(false);
  useEffect(() => () => { mounted.current = false; }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const confirm = useCallback(async () => {
    setError(""); setNotice(""); setStatus("verifying");
    try {
      await authService.confirmEmail({ email, token });
      if (!mounted.current) return;
      setStatus("success");
      setTimeout(() => {
        if (mounted.current) navigate("/login", { replace: true, state: { verified: true } });
      }, 1500);
    } catch (err) {
      if (!mounted.current) return;
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "Unexpected error. Please try again.");
    }
  }, [email, token, navigate]);

  useEffect(() => {
    if (token && !autoFired.current) {
      autoFired.current = true;
      confirm();
    }
  }, [token, confirm]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError(""); setNotice(""); setResending(true);
    try {
      await authService.resendVerification({ email });
      if (mounted.current) {
        setNotice(email ? `Confirmation email sent to ${email}.` : "Confirmation email sent.");
        setCooldown(RESEND_COOLDOWN);
      }
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof ApiError ? err.message : "Couldn't resend. Please try again.");
      }
    } finally {
      if (mounted.current) setResending(false);
    }
  };

  const busy = status === "verifying";

  return (
    <AuthLayout
      image={HERO}
      imageAlt="Young footballer sitting on a ball holding a water bottle"
      showBackButton
    >
      <AuthTitle>Email<br />Confirmation</AuthTitle>

      {email && status !== "success" && (
        <p className="mt-4 text-lg text-gray-900">
          We sent a link to <span className="font-semibold">{email}</span>
        </p>
      )}

      <div className="mt-10 space-y-6">
        {status === "success" ? (
          <div role="status" aria-live="polite"
            className="flex items-center gap-3 rounded-lg border border-lime-300 bg-lime-50 px-4 py-4">
            <svg className="h-6 w-6 shrink-0 fill-lime-600" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3l-4 4a1 1 0 01-1.4 0l-2-2 1.4-1.4L9 10.6l3.3-3.3 1.4 1.4z" />
            </svg>
            <p className="text-lg font-medium text-lime-800">Email confirmed! Redirecting to log in…</p>
          </div>
        ) : (
          <>
            <FormError message={error} />

            {notice && (
              <div role="status" aria-live="polite"
                className="rounded-lg border border-lime-300 bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800">
                {notice}
              </div>
            )}

            <AuthButton type="button" onClick={confirm} disabled={busy || resending} className="disabled:opacity-60">
              {busy ? "Confirming…" : status === "error" ? "Try again" : "Confirm email"}
            </AuthButton>

            <AuthButton type="button" onClick={handleResend}
              disabled={resending || busy || cooldown > 0} className="disabled:opacity-60">
              {resending ? "Sending…" : cooldown > 0 ? `Resend email (${cooldown}s)` : "Resend email"}
            </AuthButton>
          </>
        )}
      </div>
    </AuthLayout>
  );
}