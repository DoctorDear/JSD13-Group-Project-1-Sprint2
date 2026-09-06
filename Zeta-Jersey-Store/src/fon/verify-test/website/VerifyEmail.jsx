import { useState } from 'react';
import './style.css';

const HERO_IMG =
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80';

export default function VerifyEmail() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = 'Please enter a valid email address.';
    if (form.password.length < 8)
      next.password = 'Password must be at least 8 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // replace with real API call
    setLoading(false);
    setSuccess(`Reset link sent to ${form.email.trim()}`);
    setForm({ email: '', password: '' });
  };

  return (
    <main className="page">
      <div className="card">
        <section className="hero" style={{ backgroundImage: `url(${HERO_IMG})` }}>
          <div className="hero-overlay">
            <div className="logo">
              Zeta<sup>jersey</sup>
            </div>
            <a href="/" className="btn-back">Back to website</a>
          </div>
        </section>

        <section className="form-side">
          <h1>Verify email</h1>
          <p className="subtitle">Please enter your email</p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Your email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Your email"
              value={form.email}
              onChange={handleChange}
            />
            <span className="error">{errors.email}</span>

            <label htmlFor="password">Your password</label>
            <div className="password-wrap">
              <input
                id="password"
                name="password"
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="toggle"
                onClick={() => setShowPwd((s) => !s)}
              >
                {showPwd ? 'Hide' : 'Show'}
              </button>
            </div>
            <span className="error">{errors.password}</span>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Reset password'}
            </button>

            {success && <p className="success">{success}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}