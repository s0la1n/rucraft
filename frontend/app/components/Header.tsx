"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

const nav = [
  { href: "/developers", label: "рАЗрАБоТ4ИКИ)))" },
  { href: "/builds", label: "ПОСТРОЙКИ" },
  { href: "/skins", label: "СКИНЫ" },
  { href: "/seeds", label: "СИДЫ" },
  { href: "/mods", label: "МОДЫ" },
] as const;

export function Header() {
  const { user, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-logo" aria-label="RuCraft — на главную" onClick={() => setMenuOpen(false)}>
          <img src="./logo.svg" alt="логотип" />
        </Link>

        <button
          type="button"
          className="site-nav-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
        >
          <span className="site-nav-toggle-bar" />
          <span className="site-nav-toggle-bar" />
          <span className="site-nav-toggle-bar" />
        </button>

        <div className={`site-nav-wrap ${menuOpen ? "open" : ""}`}>
          <nav className="site-nav">
            {nav.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="site-header-actions">
            {loading ? (
              <span>...</span>
            ) : user ? (
              <>
                <Link className="btn-auth" href="/profile" onClick={() => setMenuOpen(false)}>Профиль</Link>
                {user.role === "admin" && (
                  <Link className="btn-auth" href="/admin" onClick={() => setMenuOpen(false)}>Админ</Link>
                )}
                <button className="btn-auth" type="button" onClick={() => { setMenuOpen(false); logout(); }}>
                  Выход
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="btn-auth" onClick={() => setMenuOpen(false)}>
                  ВОЙТИ
                </Link>
                <Link href="/auth/register" className="btn-auth btn-register" onClick={() => setMenuOpen(false)}>
                  ЗАРЕГИСТРИРОВАТЬСЯ
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
