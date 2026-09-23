import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthLayout, { AuthTitle, AuthButton } from "../components/AuthLayout";
import Field from "../components/Field";
import FormError from "../components/FormError";
import useForm from "../hooks/useForm";
import { authService } from "../services/auth";
import { rules } from "../lib/validation";

const HERO =
  "https://plus.unsplash.com/premium_photo-1747861973999-ca58813aaf21?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=900&q=80";

const schema = { email: [rules.email()] };

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const f = useForm({ email: state?.email || "" }, schema, async (values, { signal }) => {
    await authService.requestPasswordReset(values, { signal });
    navigate("/auth/verify-email", { state: { email: values.email, sent: true } });
  });

  return (
    <AuthLayout
      image={HERO}
      imageAlt="Female footballer in a blue jersey"
      showBackButton
      onBack={() => navigate("/")}
    >
      <AuthTitle className="p-[3px]">Reset password</AuthTitle>
      <p className="mt-4 text-[13px] text-gray-900 p-[3px]">Password problem ? We got you!</p>

      <form onSubmit={f.handleSubmit} noValidate className="mt-6 space-y-4 p-[3px]">
        <FormError message={f.formError} className="p-[3px]" />

        <Field label="Email" name="email" type="email" placeholder="Your email"
          value={f.values.email} onChange={f.handleChange} onBlur={f.handleBlur}
          error={f.errorFor("email")} autoComplete="email" className="p-[3px]" />

        <AuthButton type="submit" disabled={f.submitting} className="mt-6 disabled:opacity-60 p-[3px]">
          {f.submitting ? "Sending…" : "Summit email address"}
        </AuthButton>

        <p className="mt-4 text-center text-[13px] text-gray-900 p-[3px]">
          Remembered it?{" "}
          <Link to="/auth/login" className="underline underline-offset-2 font-medium hover:text-indigo-700 p-[3px]">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}