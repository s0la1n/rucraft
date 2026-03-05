"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageSection } from "../../components/PageSection";
import { seedsApi, type SeedPost } from "@/lib/api";

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
        )}
      </PageSection>
    </div>
  );
}

