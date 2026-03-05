"use client";

import Link from "next/link";
import { RequireAuth } from "../../components/RequireAuth";
import { PageSection } from "../../components/PageSection";

export default function AdminSeedsPage() {
  return (
    <RequireAuth adminOnly>
      <div className="page-content">
        <Link href="/admin" className="admin-back">
          ← Админ-панель
        </Link>
        <PageSection title="Модерация: Сиды">
          <p>Список сидов на модерации. Одобрить / отклонить. Подключится к API.</p>
        </PageSection>
      </div>
    </RequireAuth>
  );
}
