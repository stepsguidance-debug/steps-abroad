import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiClient } from "@/lib/apiClient";
import type { Role, User } from "@/lib/types";

interface AuthCtx {
  user: User | null;
  role: Role | null;
  login: (email: string, password: string, role: Role) => Promise<User>;
  logout: () => void;
  loading: boolean;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = apiClient.loadAuth();
    if (saved) setUser(saved.user);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string, role: Role) => {
    const res = await apiClient.login(email, password, role);
    apiClient.saveAuth(res.token, res.user);
    setUser(res.user);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    apiClient.clearAuth();
    setUser(null);
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({ user, role: user?.role ?? null, login, logout, loading }),
    [user, login, logout, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
