"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export function RequireAuth({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (adminOnly && user.role !== "admin") {
      router.replace("/");
    }
  }, [user, loading, adminOnly, router]);

  if (loading) {
    return (
      <div className="require-auth-loading">
        <p>Загрузка…</p>
      </div>
    );
  }
  if (!user) return null;
  if (adminOnly && user.role !== "admin") return null;
  return <>{children}</>;
}
