// ResetPassword.jsx
import { useState } from "react";
import "./ResetPassword.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ResetPassword({ onSubmit }) {
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [status, setStatus]   = useState("idle"); // idle | loading | sent

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = email.trim();

    if (!value)                return setError("Please enter your email.");
    if (!EMAIL_RE.test(value)) return setError("That email doesn’t look right.");

    setError("");
    setStatus("loading");
    try {
      if (onSubmit) await onSubmit(value);
      else await new Promise((r) => setTimeout(r, 900));
      setStatus("sent");
    } catch {
      setError("Something went wrong. Try again.");
      setStatus("idle");
    }
  };

  const label =
    status === "loading" ? "Sending…" :
    status === "sent"    ? "Link sent ✓" :
                           "Submit email address";

  return (
    <main className="screen">
      <header className="head">
        <div className="logo">
          Zeta<span className="logo-sup">jersey</span>
        </div>
        <h1 className="title">Reset password</h1>
        <p className="subtitle">Password problem ?&nbsp; We got you!</p>
      </header>

      <section className="card">
        <form onSubmit={handleSubmit} noValidate>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="Your email"
            className={`input${error ? " is-invalid" : ""}`}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
          />
          {error && <p className="error">{error}</p>}

          <button className="btn" type="submit" disabled={status !== "idle"}>
            {label}
          </button>
        </form>
      </section>
    </main>
  );
}