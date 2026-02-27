"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  authApi,
  clearAuthToken,
  setAuthToken,
  type User,
} from "@/lib/api";

type AuthState = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState & {
  login: (login: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    login: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("rucraft_token") : null;
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: u } = await authApi.me();
      setUser(u);
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(
    async (loginVal: string, password: string) => {
      const { user: u, token } = await authApi.login({ login: loginVal, password });
      setAuthToken(token);
      setUser(u);
    },
    []
  );

  const register = useCallback(
    async (data: {
      name: string;
      login: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      const { user: u, token } = await authApi.register(data);
      setAuthToken(token);
      setUser(u);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuthToken();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
