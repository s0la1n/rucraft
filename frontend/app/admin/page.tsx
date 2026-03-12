"use client";

import Link from "next/link";
import { RequireAuth } from "../components/RequireAuth";
import { PageSection } from "../components/PageSection";
import "./admin.css";

const adminTabs = [
  { href: "/admin/analytics", label: "Аналитика" },
  { href: "/admin/skins", label: "Скины" },
  { href: "/admin/builds", label: "Постройки" },
  { href: "/admin/mods", label: "Моды" },
  { href: "/admin/seeds", label: "Сиды" },
  { href: "/admin/users", label: "Пользователи" },
] as const;

export default function AdminPage() {
  return (
    <RequireAuth adminOnly>
      <div className="page-content">
        <PageSection title="Админ-панель">
          <p>Вкладки по типу контента для модерации постов. Страница «Пользователи» — бан пользователей.</p>
          <nav className="admin-tabs">
            {adminTabs.map(({ href, label }) => (
              <Link key={href} href={href}>
                {label}
              </Link>
            ))}
          </nav>
        </PageSection>
      </div>
    </RequireAuth>
  );
}
