import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthLayout, { AuthTitle, AuthButton } from "../components/AuthLayout";
import Field from "../components/Field";
import FormError from "../components/FormError";
import useForm from "../hooks/useForm";
import { useAuth } from "../context/AuthContext";
import { rules } from "../lib/validation";

const HERO =
  "https://plus.unsplash.com/premium_photo-1747429964769-d12808b90e9d?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=900&q=80";

const schema = {
  email: [rules.email()],
  password: [rules.loginPassword()],
};

const NOTICES = {
  verified: "Email confirmed — you can log in now.",
  registered: "Account created — log in to continue.",
  passwordReset: "Password reset — log in with your new password.",
  passwordChanged: "Password changed — log in with your new password.",
};

export default function Login() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useAuth();

  const noticeKey = Object.keys(NOTICES).find((key) => state?.[key]);

  const f = useForm(
    { email: state?.email || "", password: "" },
    schema,
    async (values, { signal }) => {
      await login(values, { signal });
      navigate("/login-success", { state: { from: state?.from?.pathname || "/" } });
    }
  );

  return (
    <AuthLayout image={HERO} imageAlt="Football fan sitting in stadium seats at dusk" showBackButton >
      <AuthTitle>Log in</AuthTitle>

      {noticeKey && (
        <p
          role="status"
          className="mt-4 rounded-lg border border-lime-300 bg-lime-50 px-4 py-3 text-sm font-medium text-lime-800"
        >
          {NOTICES[noticeKey]}
        </p>
      )}

      <form onSubmit={f.handleSubmit} noValidate className="mt-10 space-y-7">
        <FormError message={f.formError} />

        <Field
          label="Email"
          name="email"
          type="email"
          placeholder="Your email"
          value={f.values.email}
          onChange={f.handleChange}
          onBlur={f.handleBlur}
          error={f.errorFor("email")}
          autoComplete="email"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={f.values.password}
          onChange={f.handleChange}
          onBlur={f.handleBlur}
          error={f.errorFor("password")}
          autoComplete="current-password"
        />

        <Link
          to="/reset-password"
          className="block text-lg text-gray-900 hover:text-indigo-700 hover:underline underline-offset-2 transition"
        >
          Forget Password ?
        </Link>

        <AuthButton type="submit" disabled={f.submitting} className="disabled:opacity-60">
          {f.submitting ? "Logging in…" : "Log in"}
        </AuthButton>

        <p className="text-center text-lg text-gray-900">
          No account yet?{" "}
          <Link to="/register" className="underline underline-offset-2 font-medium hover:text-indigo-700">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
