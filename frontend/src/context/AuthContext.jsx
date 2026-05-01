/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

const readStoredAuth = () => {
  try {
    const saved = localStorage.getItem("notsteam-auth");
    return saved ? JSON.parse(saved) : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState(readStoredAuth);
  const [authLoading, setAuthLoading] = useState(true);

  const setAuth = (token, user) => {
    const next = { token, user };
    localStorage.setItem("notsteam-auth", JSON.stringify(next));
    setAuthState(next);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // no-op: frontend still clears local auth state
    } finally {
      localStorage.removeItem("notsteam-auth");
      setAuthState({ token: null, user: null });
    }
  };

  useEffect(() => {
    const hydrateAuth = async () => {
      try {
        const { data } = await api.get("/auth/me");
        if (data?.user) {
          setAuthState((prev) => {
            const next = { token: prev.token || null, user: data.user };
            localStorage.setItem("notsteam-auth", JSON.stringify(next));
            return next;
          });
        }
      } catch {
        // guest mode
      } finally {
        setAuthLoading(false);
      }
    };

    hydrateAuth();
  }, []);

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.user),
      authLoading,
      setAuth,
      logout
    }),
    [auth.token, auth.user, authLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
