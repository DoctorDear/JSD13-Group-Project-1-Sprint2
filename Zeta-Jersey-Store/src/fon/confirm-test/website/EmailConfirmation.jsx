// EmailConfirmation.jsx
import { useEffect, useState } from "react";
import "./EmailConfirmation.css";

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export default function EmailConfirmation({
  imageSrc = "https://plus.unsplash.com/premium_photo-1661893941582-3390d236d95f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  onConfirm,
  onResend,
}) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(null); // 'confirm' | 'resend' | null
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const handleConfirm = async () => {
    setLoading("confirm");
    setStatus("Confirming your email…");
    try {
      onConfirm ? await onConfirm() : await wait(1200);
      setStatus("✅ Your email has been confirmed. Redirecting…");
    } catch {
      setStatus("⚠️ Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  const handleResend = async () => {
    setLoading("resend");
    setStatus("Sending a new link…");
    try {
      onResend ? await onResend() : await wait(900);
      setStatus("📩 Email sent! Check your inbox.");
      setCooldown(30);
    } catch {
      setStatus("⚠️ Could not resend. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <main className="page">
      <div className="card">
        <section className="panel">
          <img className="panel__img" src={imageSrc} alt="Young soccer player holding a water bottle" />
          <div className="panel__overlay">
            <a href="/" className="brand">
              Zeta<span className="brand__mark">journey</span>
            </a>
            <a href="/" className="btn-ghost">Back to website</a>
          </div>
        </section>

        <section className="content">
          <h1 className="title">Email<br />Confirmation</h1>

          <div className="actions">
            <button className="btn" onClick={handleConfirm} disabled={loading !== null}>
              {loading === "confirm" ? "Confirming…" : "Confirm email"}
            </button>

            <button className="btn" onClick={handleResend} disabled={loading !== null || cooldown > 0}>
              {cooldown > 0 ? `Resend email (${cooldown}s)` : loading === "resend" ? "Sending…" : "Resend email"}
            </button>
          </div>

          <p className="status" role="status" aria-live="polite">{status}</p>
        </section>
      </div>
    </main>
  );
}