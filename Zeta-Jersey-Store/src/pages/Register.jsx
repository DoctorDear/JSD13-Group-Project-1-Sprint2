import { useNavigate, Link } from "react-router-dom";
import AuthLayout, { AuthTitle, AuthButton } from "../components/AuthLayout";
import Field from "../components/Field";
import FormError from "../components/FormError";
import { SocialButton, GoogleIcon, AppleIcon } from "../components/SocialButtons";
import useForm from "../hooks/useForm";
import { useAuth } from "../contexts/authContext.js";
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
      await register(values, { signal });
      navigate("/auth/register-success", { state: { email: values.email } });
    }
  );

  const strength = passwordStrength(f.values.password);
  const bars = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500"];

  return (
    <AuthLayout image={HERO} imageAlt="Young footballer sitting on the pitch" showBackButton>
      <AuthTitle className="pl-[3px]">Register</AuthTitle>

      <p className="mt-2.5 pl-[3px] text-lg text-gray-900">
        Already have account?{" "}
        <Link to="/auth/login" className="underline underline-offset-2 font-medium hover:text-indigo-700">
          Log in
        </Link>
      </p>

      <form onSubmit={f.handleSubmit} noValidate className="mt-[22px] space-y-5 pl-[3px]">
        <FormError message={f.formError} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="First name"
            name="firstName"
            placeholder="First name"
            value={f.values.firstName}
            onChange={f.handleChange}
            onBlur={f.handleBlur}
            error={f.errorFor("firstName")}
            autoComplete="given-name"
          />
          <Field
            label="Last name"
            name="lastName"
            placeholder="Last name"
            value={f.values.lastName}
            onChange={f.handleChange}
            onBlur={f.handleBlur}
            error={f.errorFor("lastName")}
            autoComplete="family-name"
          />
        </div>

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

        <div>
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={f.values.password}
            onChange={f.handleChange}
            onBlur={f.handleBlur}
            error={f.errorFor("password")}
            autoComplete="new-password"
          />

          {f.values.password && (
            <div className="mt-1.5 flex gap-1.5" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i < strength ? bars[strength - 1] : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="agreed"
              checked={f.values.agreed}
              onChange={f.handleChange}
              onBlur={f.handleBlur}
              className="h-6 w-6 rounded border-2 border-black accent-indigo-900 focus:ring-indigo-900"
            />
            <span className="text-lg text-gray-900">I'm agree to the Term &amp; Condition</span>
          </label>
          {f.errorFor("agreed") && (
            <p className="mt-1 text-sm font-medium text-red-600">{f.errorFor("agreed")}</p>
          )}
        </div>

        <AuthButton type="submit" disabled={f.submitting} className="disabled:opacity-60">
          {f.submitting ? "Creating account…" : "Create account"}
        </AuthButton>

        <div className="grid grid-cols-2 gap-4">
          <SocialButton icon={<GoogleIcon />} label="Google" />
          <SocialButton icon={<AppleIcon />} label="Apple" />
        </div>
      </form>
    </AuthLayout>
  );
}
