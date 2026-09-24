import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { authService } from "../services/auth";
import { onUnauthorized } from "../lib/api";
import { authUserFromResponse } from "./authUser";



export const AuthContext = createContext(null);



export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  /* restore session on first load */
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await authService.me();
        if (alive) setUser(authUserFromResponse(me));
      } catch {
        if (alive) setUser(null);
      } finally {
        if (alive) setBooting(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* api.js notifies us when a refresh failed */
  useEffect(() => onUnauthorized(() => setUser(null)), []);

  const login = useCallback(async (credentials, opts) => {
    const data = await authService.login(credentials, opts);
    const nextUser = authUserFromResponse(data);
    if (!nextUser) throw new Error("Login returned an invalid user response");
    setUser(nextUser);
    return nextUser;
  }, []);

  const register = useCallback(async (payload, opts) => {
    const data = await authService.register(payload, opts);
    return data?.data ?? data?.user ?? data;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, booting, isAuthenticated: !!user, login, register, logout, setUser }),
    [user, booting, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
