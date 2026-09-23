import { useNavigate, useLocation, Link } from "react-router-dom";
import AuthLayout, { AuthTitle, AuthButton } from "../components/AuthLayout";
import Field from "../components/Field";
import FormError from "../components/FormError";
import useForm from "../hooks/useForm";
import { authService } from "../services/auth";
import { rules, passwordStrength } from "../lib/validation";

const HERO =
  "https://plus.unsplash.com/premium_photo-1747873867619-b745ebf65c03?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=&fit=crop&w=900&q=80";

const schema = {
  email: [rules.email()],
  oldPassword: [rules.required("Your old password")],
  newPassword: [
    rules.password({ min: 8 }),
    rules.notSameAs("oldPassword", "New password must be different from the old one"),
  ],
};

export default function ChangePassword() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const f = useForm(
    { email: state?.email || "", oldPassword: "", newPassword: "" },
    schema,
    async (values, { signal }) => {
      await authService.changePassword(values, { signal });
      navigate("/change-password-success");
    }
  );

  const strength = passwordStrength(f.values.newPassword);
  const bars = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500"];

  return (
    <AuthLayout
      image={HERO}
      imageAlt="Footballer in a black and white striped jersey on the pitch"
      showBackButton
    >
      <AuthTitle>
        Change
        <br />
        password
      </AuthTitle>

      <form onSubmit={f.handleSubmit} noValidate className="mt-8 space-y-6">
        <FormError message={f.formError} />

        <Field
          label="Your email"
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
          label="Your old password"
          name="oldPassword"
          type="password"
          placeholder="Enter your password"
          value={f.values.oldPassword}
          onChange={f.handleChange}
          onBlur={f.handleBlur}
          error={f.errorFor("oldPassword")}
          autoComplete="current-password"
        />

        <div>
          <Field
            label="Your new password"
            name="newPassword"
            type="password"
            placeholder="Enter your password"
            value={f.values.newPassword}
            onChange={f.handleChange}
            onBlur={f.handleBlur}
            error={f.errorFor("newPassword")}
            autoComplete="new-password"
          />

          {f.values.newPassword && (
            <div className="mt-2 flex gap-1.5" aria-hidden="true">
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

        <AuthButton type="submit" disabled={f.submitting} className="mt-10 disabled:opacity-60">
          {f.submitting ? "Changing…" : "Change password"}
        </AuthButton>

        <p className="text-center text-lg text-gray-900">
          <Link
            to="/login"
            className="underline underline-offset-2 font-medium hover:text-indigo-700"
          >
            Back to log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
