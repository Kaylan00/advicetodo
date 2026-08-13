import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { clearSession, getSession, saveSession, setSessionLostHandler } from "../api/client";
import { auth } from "../api/endpoints";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession()?.user ?? null);
  const navigate = useNavigate();

  useEffect(() => {
    // Quando o refresh token tambem expira, o cliente avisa e a sessao cai aqui.
    setSessionLostHandler(() => {
      setUser(null);
      navigate("/entrar", { replace: true });
    });
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      async login(email, password) {
        const data = await auth.login(email, password);
        saveSession({ access: data.access, refresh: data.refresh, user: data.user });
        setUser(data.user);
      },
      async register(payload) {
        const data = await auth.register(payload);
        saveSession({ access: data.access, refresh: data.refresh, user: data.user });
        setUser(data.user);
      },
      logout() {
        clearSession();
        setUser(null);
        navigate("/entrar", { replace: true });
      },
    }),
    [user, navigate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider.");
  return context;
}
