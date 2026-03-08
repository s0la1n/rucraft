"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageSection } from "../../components/PageSection";
import { buildsApi, type BuildPost } from "@/lib/api";

export default function BuildShowPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [build, setBuild] = useState<BuildPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError("Некорректный идентификатор постройки.");
      setLoading(false);
      return;
    }

    setError(null);
    setLoading(true);

    buildsApi
      .show(id)
      .then((response) => {
        setBuild(response.data);
      })
      .catch(() => {
        setError("Не удалось загрузить постройку.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <div className="page-content">
      <PageSection title={build ? build.title : "Постройка"}>
        {loading && <p>Загрузка…</p>}
        {error && <p className="form-error">{error}</p>}
        {!loading && !error && build && (
          <div className="space-y-4">
            <p>
              Автор: <strong>{build.author.name}</strong>
            </p>
            {build.description && <p>{build.description}</p>}
            {build.images?.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {build.images.map((src) => (
                  <div key={src} className="overflow-hidden rounded-xl bg-zinc-200 dark:bg-zinc-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={build.title} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            )}
            {build.blocks?.length > 0 && (
              <div>
                <h3 className="mb-2 font-semibold">Список блоков</h3>
                <ul className="list-disc pl-5">
                  {build.blocks.map((block) => (
                    <li key={block.name}>
                      {block.name}: {block.count}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {build.video_url && (
              <div className="mt-4">
                <a href={build.video_url} className="link" target="_blank" rel="noopener noreferrer">
                  Смотреть видео
                </a>
              </div>
            )}
          </div>
        )}
      </PageSection>
    </div>
  );
}

