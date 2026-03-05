"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageSection } from "../../components/PageSection";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const ACTION_REGISTER = `${API_BASE}/register`;

export default function RegisterPage() {
  const router = useRouter();
  const { register: doRegister } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const name = (fd.get("name") as string)?.trim() ?? "";
    const login = (fd.get("login") as string)?.trim() ?? "";
    const email = (fd.get("email") as string)?.trim() ?? "";
    const password = (fd.get("password") as string) ?? "";
    const password_confirmation = (fd.get("password_confirmation") as string) ?? "";
    try {
      await doRegister({ name, login, email, password, password_confirmation });
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content page-narrow">
      <PageSection title="Регистрация">
        <p>Имя, логин, почта, пароль и повтор пароля.</p>
        <form action={ACTION_REGISTER} method="post" onSubmit={handleSubmit} className="form-stack">
          {error && <p className="form-error">{error}</p>}
          <div className="form-group">
            <label htmlFor="name">Имя</label>
            <input id="name" name="name" type="text" autoComplete="name" required placeholder="Как к вам обращаться" />
          </div>
          <div className="form-group">
            <label htmlFor="login">Логин (ник)</label>
            <input id="login" name="login" type="text" autoComplete="username" required placeholder="Уникальный логин" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Почта</label>
            <input id="email" name="email" type="email" autoComplete="email" required placeholder="email@example.com" />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required placeholder="Пароль" />
          </div>
          <div className="form-group">
            <label htmlFor="password_confirmation">Повтор пароля</label>
            <input id="password_confirmation" name="password_confirmation" type="password" autoComplete="new-password" required placeholder="Повторите пароль" />
          </div>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Регистрация…" : "Зарегистрироваться"}
          </button>
        </form>
        <p className="form-link">
          Уже есть аккаунт? <Link href="/auth/login">Вход</Link>
        </p>
      </PageSection>
    </div>
  );
}
