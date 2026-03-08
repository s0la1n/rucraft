"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageSection } from "../../components/PageSection";
import { skinsApi, type SkinPost } from "@/lib/api";

export default function SkinShowPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [skin, setSkin] = useState<SkinPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError("Некорректный идентификатор скина.");
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    skinsApi
      .show(id)
      .then((response) => {
        setSkin(response.data);
      })
      .catch(() => {
        setError("Не удалось загрузить скин.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="page-content">
      <PageSection title={skin ? skin.title : "Скин"}>
        {loading && <p>Загрузка…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && skin && (
          <div className="space-y-4">
            <p>
              Автор: <strong>{skin.author.name}</strong>
            </p>
            <div className="overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-700 max-w-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={skin.image_url} alt={skin.title} className="h-full w-full object-cover" />
            </div>
            <p>
              Категория: <strong>{skin.category}</strong>
            </p>
            <p>
              Файл развёртки:{" "}
              <a href={skin.file_url} className="link" target="_blank" rel="noopener noreferrer">
                скачать
              </a>
            </p>
          </div>
        )}
      </PageSection>
    </div>
  );
}

