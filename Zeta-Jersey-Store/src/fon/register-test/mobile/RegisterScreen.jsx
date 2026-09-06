// RegisterScreen.jsx
import { useState } from "react";
import "./RegisterScreen.css";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="22" height="22">
    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2.5 24 .5 14.6.5 6.5 5.9 2.6 13.7l7.8 6.1C12.3 13.9 17.6 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.15-3.2-.44-4.7H24v9.1h12.7c-.55 2.9-2.2 5.4-4.7 7.1l7.5 5.8c4.4-4.1 7-10.1 7-17.3z"/>
    <path fill="#FBBC05" d="M10.4 28.2a14.6 14.6 0 010-8.4l-7.8-6.1a24 24 0 000 20.6l7.8-6.1z"/>
    <path fill="#34A853" d="M24 47.5c6.2 0 11.5-2 15.3-5.6l-7.5-5.8c-2.1 1.4-4.8 2.2-7.8 2.2-6.4 0-11.7-4.4-13.6-10.3l-7.8 6.1C6.5 42.1 14.6 47.5 24 47.5z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 384 512" width="20" height="20" fill="#fff">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

const FIELDS = [
  { name: "firstName", label: "First name", placeholder: "First name", type: "text" },
  { name: "lastName",  label: "Last name",  placeholder: "Last name",  type: "text" },
  { name: "email",     label: "Email",      placeholder: "Your email", type: "email" },
  { name: "password",  label: "Password",   placeholder: "Password",   type: "password" },
];

const validators = {
  firstName: v => (v.trim() ? "" : "First name is required"),
  lastName:  v => (v.trim() ? "" : "Last name is required"),
  email:     v => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email"),
  password:  v => (v.length >= 8 ? "" : "Password must be at least 8 characters"),
};

export default function RegisterScreen({ onSubmit, onSocial }) {
  const [values, setValues] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [agreed, setAgreed] = useState(true);

  const handleChange = ({ target: { name, value } }) => {
    setValues(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: validators[name](value) }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const next = {};
    Object.keys(validators).forEach(k => { next[k] = validators[k](values[k]); });
    setErrors(next);
    if (Object.values(next).some(Boolean) || !agreed) return;
    onSubmit?.(values);
  };

  return (
    <main className="screen">
      <header className="head">
        <div className="logo">Zeta<span className="logo-sub">jersey</span></div>
        <h1 className="title">Register</h1>
        <p className="subtitle">
          Already have account? <a href="#login">Log in</a>
        </p>
      </header>

      <section className="card">
        <div className="social-row">
          <button type="button" className="social-btn" onClick={() => onSocial?.("google")}>
            <GoogleIcon /><span>Google</span>
          </button>
          <button type="button" className="social-btn" onClick={() => onSocial?.("apple")}>
            <AppleIcon /><span>Apple</span>
          </button>
        </div>

        <div className="divider"><span>or</span></div>

        <form onSubmit={handleSubmit} noValidate>
          {FIELDS.map(f => (
            <label className="field" key={f.name}>
              <span className="label">{f.label}</span>
              <input
                type={f.type}
                name={f.name}
                value={values[f.name]}
                placeholder={f.placeholder}
                onChange={handleChange}
                className={errors[f.name] ? "invalid" : ""}
              />
              <small className="error">{errors[f.name]}</small>
            </label>
          ))}

          <label className="check-row">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <span className="box" />
            <span className="check-text">I'm agree to&nbsp; the Term &amp; Condition</span>
          </label>

          <button type="submit" className="submit-btn" disabled={!agreed}>
            Create account
          </button>
        </form>
      </section>
    </main>
  );
}