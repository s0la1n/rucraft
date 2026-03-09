"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { AddSkinModal } from "./AddSkinModal";

const CATEGORIES: { value: string; label: string }[] = [
  { value: "", label: "Все" },
  { value: "Смешные", label: "Смешные" },
  { value: "Для девочек", label: "Для девочек" },
  { value: "Для мальчиков", label: "Для мальчиков" },
  { value: "Аниме", label: "Аниме" },
  { value: "Мобы", label: "Мобы" },
  { value: "Милые", label: "Милые" },
  { value: "Ютуберы", label: "Ютуберы" },
];

export function SkinsToolbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const currentCategory = searchParams.get("category") ?? "";

  return (
    <>
      <div className="skins-toolbar">
        <div className="skins-filters">
          {CATEGORIES.map(({ value, label }) => (
            <Link
              key={value || "all"}
              href={value ? `/skins?category=${encodeURIComponent(value)}` : "/skins"}
              className={`skins-filter-btn ${currentCategory === value ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
        {user != null && (
          <div className="skins-actions">
            <button type="button" className="skins-action-btn" onClick={() => setAddModalOpen(true)}>
              Добавить
            </button>
            <Link href="/skins/create" className="skins-action-btn">
              Создать
            </Link>
          </div>
        )}
      </div>
      <AddSkinModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSuccess={() => router.refresh()} />
    </>
  );
}
