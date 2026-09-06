import { useState } from "react";
import "./LoginPage.css";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!isEmail(form.email.trim())) next.email = "Please enter a valid email address.";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters.";

    setErrors(next);
    if (Object.keys(next).length) return setStatus("");

    setStatus("Signing you in…");
    console.log(form);
  };

  return (
    <main className="page">
      <section className="card">
        <div className="card__media">
          <img
            src="https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=900&q=80"
            alt="Man sitting in stadium seats"
          />
        </div>

        <form className="card__form" onSubmit={handleSubmit} noValidate>
          <h1 className="title">Log in</h1>

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email" placeholder="Your email"
              value={form.email} onChange={handleChange}
              className={errors.email ? "invalid" : ""}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password" name="password" type="password" placeholder="Enter your password"
              value={form.password} onChange={handleChange}
              className={errors.password ? "invalid" : ""}
            />
          </div>

          <a className="forgot" href="#reset">Forget Password ?</a>

          <button className="btn" type="submit">Log in</button>

          <p className={`msg ${status ? "ok" : ""}`}>
            {errors.email || errors.password || status}
          </p>
        </form>
      </section>
    </main>
  );
}