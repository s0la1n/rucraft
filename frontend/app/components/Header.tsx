"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const nav = [
  { href: "/developers", label: "Разработчики" },
  { href: "/builds", label: "Постройки" },
  { href: "/skins", label: "Скины" },
  { href: "/mods", label: "Моды" },
  { href: "/seeds", label: "Сиды" },
] as const;

export function Header() {
  const { user, loading, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo" aria-label="RuCraft — на главную">
          RuCraft
        </Link>
        <nav className="site-nav">
          {nav.map(({ href, label }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="site-header-actions">
          {loading ? (
            <span>...</span>
          ) : user ? (
            <>
              <Link href="/profile">Профиль</Link>
              {user.role === "admin" && (
                <Link href="/admin">Админ</Link>
              )}
              <button type="button" onClick={() => logout()}>
                Выход
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login">Войти</Link>
              <Link href="/auth/register" className="btn-register">
                Зарегистрироваться
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
