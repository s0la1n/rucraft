"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RequireAuth } from "../../components/RequireAuth";
import { PageSection } from "../../components/PageSection";
import { adminApi } from "@/lib/api";

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
    adminApi
      .users()
      .then(setData)
      .catch(() => setError("Не удалось загрузить список"));
  }, []);

  async function handleBan(userId: number) {
    setActioning(userId);
    try {
      await adminApi.banUser(userId);
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((u) =>
                u.id === userId ? { ...u, is_banned: true } : u
              ),
            }
          : null
      );
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
      setData((prev) =>
        prev
          ? {
              ...prev,
              data: prev.data.map((u) =>
                u.id === userId ? { ...u, is_banned: false } : u
              ),
            }
          : null
      );
    } catch {
      setError("Ошибка при разбане");
    } finally {
      setActioning(null);
    }
  }

  return (
    <RequireAuth adminOnly>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/admin" className="text-sm text-zinc-500 hover:underline">
          ← Админ-панель
        </Link>
        <PageSection title="Пользователи">
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}
          {data && (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-100 dark:bg-zinc-800">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Имя</th>
                    <th className="px-3 py-2">Логин</th>
                    <th className="px-3 py-2">Почта</th>
                    <th className="px-3 py-2">Роль</th>
                    <th className="px-3 py-2">Статус</th>
                    <th className="px-3 py-2">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((u) => (
                    <tr key={u.id} className="border-t border-zinc-200 dark:border-zinc-700">
                      <td className="px-3 py-2">{u.id}</td>
                      <td className="px-3 py-2">{u.name}</td>
                      <td className="px-3 py-2">{u.login}</td>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">{u.role}</td>
                      <td className="px-3 py-2">
                        {u.is_banned ? (
                          <span className="text-red-600 dark:text-red-400">Забанен</span>
                        ) : (
                          <span className="text-zinc-500">Активен</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {u.is_banned ? (
                          <form
                            action={`${API_BASE}/admin/users/${u.id}/unban`}
                            method="post"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleUnban(u.id);
                            }}
                            className="inline"
                          >
                            <button
                              type="submit"
                              disabled={actioning === u.id}
                              className="text-emerald-600 hover:underline disabled:opacity-50 dark:text-emerald-400"
                            >
                              Разбанить
                            </button>
                          </form>
                        ) : (
                          <form
                            action={`${API_BASE}/admin/users/${u.id}/ban`}
                            method="post"
                            onSubmit={(e) => {
                              e.preventDefault();
                              handleBan(u.id);
                            }}
                            className="inline"
                          >
                            <button
                              type="submit"
                              disabled={actioning === u.id}
                              className="text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                            >
                              Забанить
                            </button>
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
      </main>
    </RequireAuth>
  );
}
