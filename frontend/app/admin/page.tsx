"use client";

import Link from "next/link";
import { RequireAuth } from "../components/RequireAuth";
import { PageSection } from "../components/PageSection";

const adminTabs = [
  { href: "/admin/skins", label: "Скины" },
  { href: "/admin/builds", label: "Постройки" },
  { href: "/admin/mods", label: "Моды" },
  { href: "/admin/seeds", label: "Сиды" },
  { href: "/admin/users", label: "Пользователи" },
] as const;

export default function AdminPage() {
  return (
    <RequireAuth adminOnly>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PageSection title="Админ-панель">
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            Вкладки по типу контента для модерации постов. Страница «Пользователи» — бан пользователей.
          </p>
          <nav className="flex flex-wrap gap-2">
            {adminTabs.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {label}
              </Link>
            ))}
          </nav>
        </PageSection>
      </main>
    </RequireAuth>
  );
}
