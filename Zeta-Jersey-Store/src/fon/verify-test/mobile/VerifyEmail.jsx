// VerifyEmail.jsx
import { useState } from "react";
import "./VerifyEmail.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function VerifyEmail({ onSubmit }) {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!EMAIL_RE.test(values.email.trim()))
      next.email = "Please enter a valid email address.";
    if (values.password.length < 8)
      next.password = "Password must be at least 8 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await (onSubmit?.(values) ?? new Promise((r) => setTimeout(r, 1200)));
      setValues({ email: "", password: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="screen">
      <header className="head">
        <div className="logo">
          Zeta<span className="logo__tag">jersey</span>
        </div>
        <h1 className="title">Verify email</h1>
        <p className="subtitle">Please enter your e-mail</p>
      </header>

      <section className="card">
        <form onSubmit={handleSubmit} noValidate>
          <Field
            id="email" label="Email" type="email" placeholder="Your email"
            value={values.email} error={errors.email} onChange={handleChange}
          />
          <Field
            id="password" label="New Password" type="password" placeholder="Your password"
            value={values.password} error={errors.password} onChange={handleChange}
          />

          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Resetting…" : "Reset password"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ id, label, error, ...rest }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        className={error ? "is-invalid" : ""}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      <small className="error">{error}</small>
    </div>
  );
}