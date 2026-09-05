import { useState } from "react";
import "./style.css";

const HERO_IMG =
  "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1000&q=80";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l6.2 5.2C36.9 40.2 44 35 44 24c0-1.3-.1-2.6-.4-3.9z" />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 384 512" width="20" height="20" fill="#fff" aria-hidden="true">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
  </svg>
);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [agreed, setAgreed] = useState(true);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validate = () => {
    const err = {};
    if (!form.firstName.trim()) err.firstName = "Required";
    if (!form.lastName.trim()) err.lastName = "Required";
    if (!EMAIL_RE.test(form.email)) err.email = "Invalid email";
    if (form.password.length < 8) err.password = "Min 8 characters";
    if (!agreed) err.terms = "Please accept the terms";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 900)); // replace with your API call
      alert(`Welcome, ${form.firstName}! Account created 🎉`);
      setForm({ firstName: "", lastName: "", email: "", password: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <div className="hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.18), rgba(0,0,0,0) 40%), url(${HERO_IMG})` }}>
          <div className="hero-top">
            <div className="logo">Zeta<span className="logo-sup">Jersey</span></div>
            <button className="btn-back" type="button">Back to website</button>
          </div>
        </div>

        <div className="form-side">
          <h1 className="title">Register</h1>
          <p className="subtitle">
            Already have account? <a href="#login" className="link">Log in</a>
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="row">
              <div className="field">
                <label htmlFor="firstName">First name</label>
                <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange}
                  placeholder="First name" className={errors.firstName ? "error" : ""} />
              </div>
              <div className="field">
                <label htmlFor="lastName">Last name</label>
                <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange}
                  placeholder="Last name" className={errors.lastName ? "error" : ""} />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="Your email" className={errors.email ? "error" : ""} />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="password-wrap">
                <input id="password" name="password" type={showPw ? "text" : "password"}
                  value={form.password} onChange={handleChange}
                  placeholder="Enter your password" className={errors.password ? "error" : ""} />
                <button type="button" className="toggle-pw" onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <label className="checkbox">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span className="box" aria-hidden="true" />
              <span className="checkbox-text">I'm agree to the Term &amp; Condition</span>
            </label>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating…" : "Create account"}
            </button>

            <div className="social-row">
              <button type="button" className="btn-social" onClick={() => console.log("OAuth → Google")}>
                <GoogleIcon /> <span>Google</span>
              </button>
              <button type="button" className="btn-social" onClick={() => console.log("OAuth → Apple")}>
                <AppleIcon /> <span>Apple</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}