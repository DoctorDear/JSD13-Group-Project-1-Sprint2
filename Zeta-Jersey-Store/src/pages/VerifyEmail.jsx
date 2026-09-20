import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthLayout, { AuthTitle, AuthButton } from "../components/AuthLayout";
import Field from "../components/Field";
import FormError from "../components/FormError";
import useForm from "../hooks/useForm";
import { authService } from "../services/auth";
import { rules } from "../lib/validation";

const HERO =
  "https://plus.unsplash.com/premium_photo-1665673313491-22509937fc9f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=900&q=80";

const schema = {
  email: [rules.email()],
  password: [rules.password({ min: 8 })],
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const f = useForm(
    { email: state?.email || "", password: "" },
    schema,
    async (values, { signal }) => {
      await authService.verifyEmail(values, { signal });
      navigate("/email-confirmation", { state: { email: values.email } });
    }
  );

  return (
    <AuthLayout
      image={HERO}
      imageAlt="Footballer sitting on the pitch beside a ball"
      showBackButton
      onBack={() => navigate("/")}
    >
      <AuthTitle className="p-[3px]">Verify email</AuthTitle>
      <p className="mt-3 text-[13px] text-gray-900 p-[3px]">Please enter your email</p>

      {state?.sent && (
        <p role="status" className="mt-4 rounded-lg border border-lime-300 bg-lime-50 px-4 py-3 text-[10px] font-medium text-lime-800 p-[3px]">
          We've emailed you a reset link.
        </p>
      )}

      <form onSubmit={f.handleSubmit} noValidate className="mt-6 space-y-4 p-[3px]">
        <FormError message={f.formError} className="p-[3px]" />

        <Field label="Your email" name="email" type="email" placeholder="Your email"
          value={f.values.email} onChange={f.handleChange} onBlur={f.handleBlur}
          error={f.errorFor("email")} autoComplete="email" className="p-[3px]" />
        <Field label="Your password" name="password" type="password" placeholder="Enter your password"
          value={f.values.password} onChange={f.handleChange} onBlur={f.handleBlur}
          error={f.errorFor("password")} autoComplete="new-password" className="p-[3px]" />

        <AuthButton type="submit" disabled={f.submitting} className="mt-6 disabled:opacity-60 p-[3px]">
          {f.submitting ? "Resetting…" : "Confirm password"}
        </AuthButton>

        <p className="text-center text-[13px] text-gray-900 p-[3px]">
          <Link to="/login" className="underline underline-offset-2 font-medium hover:text-indigo-700 p-[3px]">
            Back to log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}