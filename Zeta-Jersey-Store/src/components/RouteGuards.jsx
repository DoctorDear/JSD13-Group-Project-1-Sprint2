import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { loginReturnPath } from "../lib/loginReturnPath.js";

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-700 to-violet-500">
      <div
        role="status"
        aria-label="Loading"
        className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white"
      />
    </div>
  );
}

/** Blocks anonymous users — sends them to /login and remembers where they were headed. */
export function ProtectedRoute() {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) return <Splash />;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Keeps logged-in users out of the auth pages. */
export function GuestRoute() {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) return <Splash />;
  if (isAuthenticated) {
    const target = location.state?.from
      ? loginReturnPath(location.state.from)
      : "/auth/login-success";
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}

/** Blocks non-admin users — requires login with role: 'admin'. */
export function AdminRoute() {
  const { user, isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) return <Splash />;
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
