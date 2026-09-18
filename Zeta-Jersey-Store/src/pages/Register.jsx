import { useNavigate, Link } from "react-router-dom";
import AuthLayout, { AuthTitle, AuthButton } from "../components/AuthLayout";
import Field from "../components/Field";
import FormError from "../components/FormError";
import { SocialButton, GoogleIcon, AppleIcon } from "../components/SocialButtons";
import useForm from "../hooks/useForm";
import { useAuth } from "../context/AuthContext";
import { rules, passwordStrength } from "../lib/validation";

const HERO =
  "https://plus.unsplash.com/premium_photo-1676736592730-bfd847c0c8c8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=900&q=80";

const schema = {
  firstName: [rules.required("First name")],
  lastName: [rules.required("Last name")],
  email: [rules.email()],
  password: [rules.password({ min: 8 })],
  agreed: [rules.checked("You must accept the Terms & Conditions")],
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const f = useForm(
    { firstName: "", lastName: "", email: "", password: "", agreed: false },
    schema,
    async (values, { signal }) => {
      try {
        await register(values, { signal });
      } catch (err) {
        if (err?.status && err.status !== 0) {
          throw err;
        }
      }
      navigate("/email-confirmation", { state: { email: values.email } });
    }
  );

  const strength = passwordStrength(f.values.password);
  const bars = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500"];

  return (
    <AuthLayout
      image={HERO}
      imageAlt="Young footballer sitting on the pitch"
      showBackButton
      onBack={() => navigate("/")}
    >
      <AuthTitle className="p-[3px]">Register</AuthTitle>

      <p className="mt-3 text-[13px] text-gray-900 p-[3px]">
        Already have account?{" "}
        <Link to="/login" className="underline underline-offset-2 font-medium hover:text-indigo-700 p-[3px]">
          Log in
        </Link>
      </p>

      <form onSubmit={f.handleSubmit} noValidate className="mt-4 space-y-3 p-[3px]">
        <FormError message={f.formError} className="p-[3px]" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-[3px]">
          <Field label="First name" name="firstName" placeholder="First name"
            value={f.values.firstName} onChange={f.handleChange} onBlur={f.handleBlur}
            error={f.errorFor("firstName")} autoComplete="given-name" className="p-[3px]" />
          <Field label="Last name" name="lastName" placeholder="Last name"
            value={f.values.lastName} onChange={f.handleChange} onBlur={f.handleBlur}
            error={f.errorFor("lastName")} autoComplete="family-name" className="p-[3px]" />
        </div>

        <Field label="Email" name="email" type="email" placeholder="Your email"
          value={f.values.email} onChange={f.handleChange} onBlur={f.handleBlur}
          error={f.errorFor("email")} autoComplete="email" className="p-[3px]" />

        <div className="p-[3px]">
          <Field label="Password" name="password" type="password" placeholder="Enter your password"
            value={f.values.password} onChange={f.handleChange} onBlur={f.handleBlur}
            error={f.errorFor("password")} autoComplete="new-password" className="p-[3px]" />

          <div className="h-2 mt-1 p-[3px]" aria-hidden="true">
            <div className={`flex gap-1.5 transition-opacity p-[3px] ${f.values.password ? "opacity-100" : "opacity-0"}`}>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors p-[3px] ${
                    i < strength ? bars[strength - 1] : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-[3px]">
          <label className="flex items-center gap-3 pt-1 cursor-pointer select-none p-[3px]">
            <input
              type="checkbox"
              name="agreed"
              checked={f.values.agreed}
              onChange={f.handleChange}
              onBlur={f.handleBlur}
              className="h-5 w-5 rounded border-2 border-black accent-indigo-900 focus:ring-indigo-900 shrink-0 p-[3px]"
            />
            <span className="text-[11px] text-gray-900 p-[3px]">I'm agree to the Term &amp; Condition</span>
          </label>
          <div className="min-h-[18px] mt-1 p-[3px]">
            {f.errorFor("agreed") && (
              <p className="text-[10px] font-medium text-red-600 p-[3px]">{f.errorFor("agreed")}</p>
            )}
          </div>
        </div>

        <AuthButton type="submit" disabled={f.submitting} className="disabled:opacity-60 p-[3px]">
          {f.submitting ? "Creating account…" : "Create account"}
        </AuthButton>

        <div className="grid grid-cols-2 gap-4 pt-1 p-[3px]">
          <SocialButton icon={<GoogleIcon />} label="Google" className="p-[3px]" />
          <SocialButton icon={<AppleIcon />} label="Apple" className="p-[3px]" />
        </div>
      </form>
    </AuthLayout>
  );
}