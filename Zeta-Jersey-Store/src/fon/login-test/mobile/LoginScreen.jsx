// LoginScreen.jsx
import { useState } from "react";
import "./login.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ onSubmit }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: "" }));
  };

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    else if (!EMAIL_RE.test(form.email.trim())) next.email = "Enter a valid email";
    if (!form.password) next.password = "Password is required";
    else if (form.password.length < 6) next.password = "Minimum 6 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await (onSubmit?.(form) ?? new Promise((r) => setTimeout(r, 900)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="screen">
      <header className="head">
        <div className="logo">
          Zeta<span className="logo-sup">jersey</span>
        </div>
        <h1 className="title">Welcome back!</h1>
        <p className="subtitle">Please enter your details</p>
      </header>

      <section className="card">
        <form onSubmit={submit} noValidate>
          <Field
            id="email" label="Email" type="email" placeholder="Your email"
            value={form.email} error={errors.email} onChange={change}
            autoComplete="email" inputMode="email"
          />
          <Field
            id="password" label="Password" type="password" placeholder="Your password"
            value={form.password} error={errors.password} onChange={change}
            autoComplete="current-password"
          />

          <a className="forgot" href="#">Forget Password ?</a>

          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ id, label, error, ...rest }) {
  return (
    <>
      <label className="label" htmlFor={id}>{label}</label>
      <input
        id={id} name={id}
        className={`input${error ? " invalid" : ""}`}
        aria-invalid={!!error}
        {...rest}
      />
      <p className="error">{error}</p>
    </>
  );
}