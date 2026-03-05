"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageSection } from "../../components/PageSection";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const ACTION_LOGIN = `${API_BASE}/login`;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const loginVal = (fd.get("login") as string)?.trim() ?? "";
    const password = (fd.get("password") as string) ?? "";
    try {
      await login(loginVal, password);
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content page-narrow">
      <PageSection title="Вход">
        <form action={ACTION_LOGIN} method="post" onSubmit={handleSubmit} className="form-stack">
          {error && <p className="form-error">{error}</p>}
          <div className="form-group">
            <label htmlFor="login">Логин или почта</label>
            <input id="login" name="login" type="text" autoComplete="username" required placeholder="Логин или email" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required placeholder="Пароль" />
          </div>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Вход…" : "Войти"}
          </button>
        </form>
        <p className="form-link">
          Нет аккаунта? <Link href="/auth/register">Регистрация</Link>
        </p>
      </PageSection>
    </div>
  );
}
