// ResetPassword.jsx
import { useState } from "react";
import "./ResetPassword.css"; // reuse the CSS above

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const value = email.trim();
    if (!value) return setError("Please enter your email address.");
    if (!EMAIL_RE.test(value)) return setError("That doesn't look like a valid email.");

    setLoading(true);
    try {
      // await fetch("/api/reset-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: value }),
      // });
      await new Promise((r) => setTimeout(r, 1200));
      setSuccess(`Reset link sent to ${value}. Check your inbox!`);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="card">
        <section className="card__media">
          <img
            src="https://plus.unsplash.com/premium_photo-1747861973999-ca58813aaf21?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Athlete in a blue jersey"
          />
          <div className="card__media-overlay">
            <span className="logo">
              Zeta<sup>Jersey</sup>
            </span>
            <a href="/" className="btn-ghost">Back to website</a>
          </div>
        </section>

        <section className="card__content">
          <h1 className="title">Reset password</h1>
          <p className="subtitle">Password problem ? We got you!</p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              className={`input ${error ? "is-invalid" : ""}`}
              placeholder="Your email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
            />
            {error && <p className="error" role="alert">{error}</p>}

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Sending..." : "Summit email address"}
            </button>

            {success && <p className="success">{success}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}