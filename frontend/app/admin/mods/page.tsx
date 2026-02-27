"use client";

import Link from "next/link";
import { RequireAuth } from "../../components/RequireAuth";
import { PageSection } from "../../components/PageSection";

export default function AdminModsPage() {
  return (
    <RequireAuth adminOnly>
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/admin" className="text-sm text-zinc-500 hover:underline">
        ← Админ-панель
      </Link>
      <PageSection title="Модерация: Моды">
        <p className="text-zinc-600 dark:text-zinc-400">
          Список модов на модерации. Одобрить / отклонить. Подключится к API.
        </p>
      </PageSection>
    </main>
    </RequireAuth>
  );
}
