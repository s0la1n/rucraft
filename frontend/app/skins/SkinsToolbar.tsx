"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { AddSkinModal } from "./AddSkinModal";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "", label: "Все" },
  { value: "Смешные", label: "Смешные" },
  { value: "Для девочек", label: "Для девочек" },
  { value: "Для мальчиков", label: "Для мальчиков" },
  { value: "Аниме", label: "Аниме" },
];

export function SkinsToolbar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const currentCategory = searchParams.get("category") ?? "";
  const currentPage = searchParams.get("page") ?? "1";

  function buildUrl(category: string, page: string) {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (page && page !== "1") p.set("page", page);
    const q = p.toString();
    return `/skins${q ? `?${q}` : ""}`;
  }

  return (
    <>
      <div className="skins-toolbar">
        <div className="skins-filters">
          {CATEGORIES.map(({ value, label }) => (
            <Link
              key={value || "all"}
              href={buildUrl(value, currentPage)}
              className={`skins-filter-btn ${currentCategory === value ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
        {user && (
          <div className="skins-actions">
            <button
              type="button"
              className="skins-action-btn"
              onClick={() => setAddModalOpen(true)}
            >
              Добавить
            </button>
            <Link href="/skins/create" className="skins-action-btn">
              Создать
            </Link>
          </div>
        )}
      </div>
      <AddSkinModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
