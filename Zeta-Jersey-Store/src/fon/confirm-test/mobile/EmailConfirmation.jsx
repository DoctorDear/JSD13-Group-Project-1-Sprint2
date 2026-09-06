// EmailConfirmation.jsx
import { useEffect, useRef, useState } from "react";
import "./EmailConfirmation.css";

export default function EmailConfirmation({ onConfirm, onResend }) {
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [status, setStatus] = useState("");
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  useEffect(() => {
    if (cooldown <= 0) return;
    timerRef.current = setInterval(() => {
      setCooldown((c) => (c <= 1 ? (clearInterval(timerRef.current), 0) : c - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [cooldown]);

  const handleConfirm = async () => {
    if (confirming || confirmed) return;
    setConfirming(true);
    setStatus("");
    try {
      await (onConfirm?.() ?? new Promise((r) => setTimeout(r, 900)));
      setConfirmed(true);
      setStatus("Your email has been confirmed.");
    } catch {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setStatus("Sending…");
    try {
      await (onResend?.() ?? new Promise((r) => setTimeout(r, 700)));
      setStatus("Email sent. Check your inbox.");
      setCooldown(30);
    } catch {
      setStatus("Could not resend. Try again shortly.");
    }
  };

  return (
    <main className="screen">
      <header className="brand">
        <h1 className="logo">
          Zeta<span className="logo__sup">jersey</span>
        </h1>
        <h2 className="title">
          Email
          <br />
          Confirmation
        </h2>
      </header>

      <section className="card">
        <button
          type="button"
          className="btn"
          onClick={handleConfirm}
          disabled={confirming || confirmed}
        >
          {confirmed ? "Confirmed ✓" : confirming ? "Confirming…" : "Confirm email"}
        </button>

        <button
          type="button"
          className="btn"
          onClick={handleResend}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
        </button>

        <p className="status" role="status" aria-live="polite">{status}</p>
      </section>
    </main>
  );
}