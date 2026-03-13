"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "../../components/RequireAuth";
import { PageSection } from "../../components/PageSection";
import { adminApi } from "@/lib/api";
import "../admin.css";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type UserRow = {
  id: number;
  name: string;
  login: string;
  email: string;
  role: string;
  is_banned: boolean;
  created_at: string;
};

export default function AdminUsersPage() {
  const [data, setData] = useState<{
    data: UserRow[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actioning, setActioning] = useState<number | null>(null);

  useEffect(() => {
    adminApi.users().then(setData).catch(() => setError("Не удалось загрузить список"));
  }, []);

  async function handleBan(userId: number) {
    setActioning(userId);
    try {
      await adminApi.banUser(userId);
      setData((prev) => (prev ? { ...prev, data: prev.data.map((u) => (u.id === userId ? { ...u, is_banned: true } : u)) } : null));
    } catch {
      setError("Ошибка при бане");
    } finally {
      setActioning(null);
    }
  }

  async function handleUnban(userId: number) {
    setActioning(userId);
    try {
      await adminApi.unbanUser(userId);
      setData((prev) => (prev ? { ...prev, data: prev.data.map((u) => (u.id === userId ? { ...u, is_banned: false } : u)) } : null));
    } catch {
      setError("Ошибка при разбане");
    } finally {
      setActioning(null);
    }
  }

  return (
    <RequireAuth adminOnly>
      <div className="page-content">
        <Link href="/admin" className="admin-back">
          ← Админ-панель
        </Link>
        <PageSection title="Пользователи">
          {error && <p className="form-error">{error}</p>}
          {data && (
            <div className="table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Логин</th>
                    <th>Почта</th>
                    <th>Роль</th>
                    <th>Статус</th>
                    <th>Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((u) => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.login}</td>
                      <td>{u.email}</td>
                      <td>{u.role}</td>
                      <td>{u.is_banned ? "Забанен" : "Активен"}</td>
                      <td>
                        {u.is_banned ? (
                          <form action={`${API_BASE}/admin/users/${u.id}/unban`} method="post" onSubmit={(e) => { e.preventDefault(); handleUnban(u.id); }} className="form-inline">
                            <button type="submit" disabled={actioning === u.id} className="btn-unban">Разбанить</button>
                          </form>
                        ) : (
                          <form action={`${API_BASE}/admin/users/${u.id}/ban`} method="post" onSubmit={(e) => { e.preventDefault(); handleBan(u.id); }} className="form-inline">
                            <button type="submit" disabled={actioning === u.id} className="btn-ban">Забанить</button>
                          </form>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </PageSection>
      </div>
    </RequireAuth>
  );
}
