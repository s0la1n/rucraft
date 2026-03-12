"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageSection } from "../../components/PageSection";
import { seedsApi, type SeedPost, resolveStorageUrl } from "@/lib/api";

export default function SeedShowPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [seed, setSeed] = useState<SeedPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError("Некорректный идентификатор сида.");
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    seedsApi
      .show(id)
      .then((response) => {
        setSeed(response.data);
      })
      .catch(() => {
        setError("Не удалось загрузить сид.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="page-content">
      <PageSection title={seed ? seed.title : "Сид"}>
        {loading && <p>Загрузка…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && seed && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p>
                Автор: <strong>{seed.author.name}</strong>
              </p>
              <p>
                Номер сида: <code>{seed.seed}</code>
              </p>
              <p>
                Версия: <strong>{seed.version}</strong>, релиз: <strong>{seed.release}</strong>
              </p>
              <p>
                Координаты: x = {seed.x}, y = {seed.y}, z = {seed.z}
              </p>
            </div>

            {seed.images && seed.images.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {seed.images.map((src) => {
                  const resolved = resolveStorageUrl(src) ?? src;
                  return (
                    <div key={src} className="overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={resolved} alt={seed.title} className="h-full w-full object-cover" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </PageSection>
    </div>
  );
}

