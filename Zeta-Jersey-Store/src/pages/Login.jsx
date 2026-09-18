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

export default function Login() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useAuth();

  const f = useForm({ email: "", password: "" }, schema, async (values, { signal }) => {
    await login(values, { signal });
    navigate(state?.from?.pathname || "/dashboard", { replace: true });
  });

  return (
    <AuthLayout
      image={HERO}
      imageAlt="Football fan sitting in stadium seats at dusk"
      showBackButton
      onBack={() => navigate("/")}
    >
      <AuthTitle className="p-[3px]">Log in</AuthTitle>

      {state?.verified && (
        <p role="status" className="mt-4 rounded-lg border border-lime-300 bg-lime-50 px-4 py-3 text-[10px] font-medium text-lime-800 p-[3px]">
          Email confirmed — you can log in now.
        </p>
      )}

      {state?.passwordChanged && (
        <p role="status" className="mt-4 rounded-lg border border-lime-300 bg-lime-50 px-4 py-3 text-[11px] font-medium text-lime-800 p-[3px]">
          Password changed — log in with your new password.
        </p>
      )}

      <form onSubmit={f.handleSubmit} noValidate className="mt-6 space-y-4 p-[3px]">
        <FormError message={f.formError} className="p-[3px]" />

        <Field label="Email" name="email" type="email" placeholder="Your email"
          value={f.values.email} onChange={f.handleChange} onBlur={f.handleBlur}
          error={f.errorFor("email")} autoComplete="email" className="p-[3px]" />
        <Field label="Password" name="password" type="password" placeholder="Enter your password"
          value={f.values.password} onChange={f.handleChange} onBlur={f.handleBlur}
          error={f.errorFor("password")} autoComplete="current-password" className="p-[3px]" />

        <div className="flex items-center justify-between text-[13px] text-gray-900 p-[3px]">
          <Link
            to="/reset-password"
            className="hover:text-indigo-700 hover:underline underline-offset-2 transition"
          >
            Forget Password ?
          </Link>
          <Link
            to="/change-password"
            className="hover:text-indigo-700 hover:underline underline-offset-2 transition"
          >
            Change password
          </Link>
        </div>

        <AuthButton type="submit" disabled={f.submitting} className="disabled:opacity-60 p-[3px]">
          {f.submitting ? "Logging in…" : "Log in"}
        </AuthButton>

        <p className="text-center text-[13px] text-gray-900 p-[3px]">
          No account yet?{" "}
          <Link to="/register" className="underline underline-offset-2 font-medium hover:text-indigo-700 p-[3px]">
            Register
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}