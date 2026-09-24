import { useLocation } from "react-router-dom";
import SuccessLayout from "../components/SuccessLayout";
import { useAuth } from "../contexts/AuthContext";
import { goToSite } from "../config";

const HERO =
  "https://images.unsplash.com/photo-1551854386-b42759a60dd0?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dauto=format&fit=crop&w=900&q=80";


export default function LoginSuccess() {
  const { state } = useLocation();
  const { user } = useAuth();
  const target = state?.from || "/";

  return (
    <SuccessLayout
      image={HERO}
      imageAlt="Supporter in a teal football jersey"
      title={<>Log in<br />successfully</>}
      subtitle={
        user?.firstName ? <>Welcome back, <span className="font-semibold">{user.firstName}</span>.</> : null
      }
      subtitle={
        <a
          href="http://localhost:5173"
          className="mt-3 inline-block text-lg text-gray-900 underline underline-offset-2 font-medium hover:text-indigo-700"
        >
          Go back to shopping
        </a>
      }
    />
  );
}