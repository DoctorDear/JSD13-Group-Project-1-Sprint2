import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { goToSite } from "../config";

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

/** Keeps logged-in users out of the auth pages — sends them back to the main site. */
export function GuestRoute() {
  const { isAuthenticated, booting } = useAuth();

  useEffect(() => {
    if (!booting && isAuthenticated) goToSite("/");
  }, [booting, isAuthenticated]);

  if (booting || isAuthenticated) return <Splash />;
  return <Outlet />;
}

/**
 * Kept for when you add app pages back.
 * Wrap them like: <Route element={<ProtectedRoute />}><Route path="/x" .../></Route>
 */
export function ProtectedRoute() {
  const { isAuthenticated, booting } = useAuth();
  const location = useLocation();

  if (booting) return <Splash />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}