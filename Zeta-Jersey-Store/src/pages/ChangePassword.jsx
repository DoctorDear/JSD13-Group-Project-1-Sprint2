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
      navigate("/login", { replace: true, state: { passwordChanged: true } });
    }
  );

  const strength = passwordStrength(f.values.newPassword);
  const bars = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500"];

  return (
    <AuthLayout
      image={HERO}
      imageAlt="Footballer in a black and white striped jersey on the pitch"
      showBackButton
      onBack={() => navigate("/")}
    >
      <AuthTitle className="p-[3px]">Change Password</AuthTitle>

      <form onSubmit={f.handleSubmit} noValidate className="mt-6 space-y-4 p-[3px]">
        <FormError message={f.formError} className="p-[3px]" />

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
          className="p-[3px]"
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
          className="p-[3px]"
        />

        <div className="p-[3px]">
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
            className="p-[3px]"
          />

          <div className="h-2 mt-1 p-[3px]" aria-hidden="true">
            <div
              className={`flex gap-1.5 transition-opacity p-[3px] ${
                f.values.newPassword ? "opacity-100" : "opacity-0"
              }`}
            >
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

        <AuthButton type="submit" disabled={f.submitting} className="disabled:opacity-60 p-[3px]">
          {f.submitting ? "Changing…" : "Change password"}
        </AuthButton>

        <p className="text-center text-[13px] text-gray-900 p-[3px]">
          <Link
            to="/login"
            className="underline underline-offset-2 font-medium hover:text-indigo-700 p-[3px]"
          >
            Back to log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}