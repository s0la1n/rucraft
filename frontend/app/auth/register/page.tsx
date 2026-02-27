"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PageSection } from "../../components/PageSection";

const API_REGISTER = "/api/register";

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
    <main className="mx-auto max-w-md px-4 py-12">
      <PageSection title="Регистрация">
        <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-500">
          Имя, логин, почта, пароль и повтор пароля.
        </p>
        <form
          action={ACTION_REGISTER}
          method="post"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Имя
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Как к вам обращаться"
            />
          </div>
          <div>
            <label htmlFor="login" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Логин (ник)
            </label>
            <input
              id="login"
              name="login"
              type="text"
              autoComplete="username"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Уникальный логин"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Почта
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Пароль"
            />
          </div>
          <div>
            <label htmlFor="password_confirmation" className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Повтор пароля
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Повторите пароль"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? "Регистрация…" : "Зарегистрироваться"}
          </button>
        </form>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-500">
          Уже есть аккаунт?{" "}
          <Link href="/auth/login" className="text-emerald-600 hover:underline dark:text-emerald-400">
            Вход
          </Link>
        </p>
      </PageSection>
    </main>
  );
}
